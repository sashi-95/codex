/**
 * LLMプロバイダ層
 *
 * - MockProvider: APIキー不要。各エージェントの典型的な思考→ツール使用→報告の
 *   流れを決定論的にシミュレートする (デモ/テスト用)。
 * - AnthropicProvider: ANTHROPIC_API_KEY があれば実際の Claude API を呼び出す。
 *
 * カーネルは LLMProvider インターフェースにのみ依存し、実装を差し替え可能。
 */

import { estimateTokens } from './context-manager';
import type {
  HistoryEntry,
  LLMCallMeta,
  LLMProvider,
  LLMRequest,
  LLMResponse,
} from './types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 履歴から直近のツール実行結果を収集 */
function collectToolResults(messages: HistoryEntry[]): string[] {
  return messages.filter((m) => m.role === 'tool').map((m) => m.content);
}

function usage(req: LLMRequest, outText: string) {
  const tokensIn =
    estimateTokens(req.system) +
    req.messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  return { tokensIn, tokensOut: estimateTokens(outText) };
}

// ============================================================
// MockProvider
// ============================================================

export class MockProvider implements LLMProvider {
  readonly name = 'mock-simulator';

  async complete(req: LLMRequest, meta: LLMCallMeta): Promise<LLMResponse> {
    // 推論レイテンシをシミュレート (UIでrunning状態が見えるように)
    await sleep(500 + Math.random() * 700);

    const response = this.simulate(req, meta);
    const outText = response.text ?? JSON.stringify(response.toolCall);
    return { ...response, ...usage(req, outText) };
  }

  private simulate(
    req: LLMRequest,
    meta: LLMCallMeta
  ): Pick<LLMResponse, 'text' | 'toolCall'> {
    const { agentId, step, goal } = meta;
    const toolResults = collectToolResults(req.messages);
    const lastResult = toolResults[toolResults.length - 1] ?? '';

    switch (agentId) {
      case 'orchestrator': {
        if (step === 0) {
          return {
            toolCall: {
              name: 'delegate',
              input: {
                assignments: [
                  { agent: 'researcher', goal: `「${goal}」に関する事実情報とナレッジベースの調査` },
                  { agent: 'analyst', goal: `「${goal}」に関する定量分析と試算` },
                ],
              },
            },
          };
        }
        if (step === 1) {
          return {
            toolCall: {
              name: 'delegate',
              input: {
                assignments: [
                  {
                    agent: 'writer',
                    goal: `調査・分析結果を統合し「${goal}」への最終レポートを執筆`,
                  },
                ],
              },
            },
          };
        }
        const finalBody = lastResult.replace(/^全子プロセスが終了しました。\s*/, '');
        return {
          text: `# 最終回答: ${goal}\n\n専門エージェントチームによる調査・分析・執筆が完了しました。\n\n${finalBody}\n\n---\n*Orchestrator: 全サブタスクの結果を検証し統合済み (researcher / analyst / writer 各エージェントの成果物に基づく)*`,
        };
      }

      case 'researcher': {
        if (step === 0) {
          return { toolCall: { name: 'memory_search', input: { query: goal } } };
        }
        if (step === 1) {
          return { toolCall: { name: 'web_search', input: { query: goal } } };
        }
        return {
          text: `【調査報告】\nゴール「${goal}」について、ナレッジベースとWeb検索から以下を確認:\n${toolResults.map((r) => `- ${r.split('\n')[0]}`).join('\n')}\n\n信頼度: 中〜高 (複数ソースで整合)`,
        };
      }

      case 'analyst': {
        if (step === 0) {
          return { toolCall: { name: 'memory_search', input: { query: goal } } };
        }
        if (step === 1) {
          return {
            toolCall: {
              name: 'calculator',
              input: { expression: '(1200 * 1.18) * (1.18) * (1.18)' },
            },
          };
        }
        return {
          text: `【定量分析】\nゴール「${goal}」に対する試算:\n- ベースライン1,200から年率18%成長を3期複利で試算 → ${lastResult}\n- 感度分析: 成長率±5ptで結果は約±180変動\n数値は calculator による正確な計算に基づく。`,
        };
      }

      case 'writer': {
        if (step === 0) {
          return { toolCall: { name: 'memory_search', input: { query: goal } } };
        }
        return {
          text: `## 統合レポート\n\n### 概要\n${goal}\n\n### 主要な発見\n${lastResult || '収集済みの調査・分析結果を統合。'}\n\n### 結論\n調査エージェントの事実確認とアナリストの定量試算は整合しており、提示された方向性は妥当と評価できる。次のアクションとして、詳細なリスク評価と四半期ごとのマイルストーン設定を推奨する。`,
        };
      }

      case 'critic':
      default: {
        return {
          text: `【レビュー結果】\n対象「${goal}」を検証:\n- 事実関係: 概ね妥当\n- 論理構成: 一貫性あり\n- 改善提案: 一次データの出典明記と、反証ケースの検討を追加すべき`,
        };
      }
    }
  }
}

// ============================================================
// AnthropicProvider
// ============================================================

interface AnthropicContentBlock {
  type: string;
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
}

export class AnthropicProvider implements LLMProvider {
  readonly name: string;

  constructor(
    private apiKey: string,
    private model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5'
  ) {
    this.name = `anthropic/${this.model}`;
  }

  async complete(req: LLMRequest, _meta: LLMCallMeta): Promise<LLMResponse> {
    // 履歴をテキストメッセージに平坦化 (ツール結果は注釈付きユーザーメッセージ)
    const messages = req.messages.map((m) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content:
        m.role === 'tool'
          ? `[ツール ${m.toolName ?? 'unknown'} の実行結果]\n${m.content}`
          : m.content,
    }));
    if (messages.length === 0) {
      messages.push({ role: 'user', content: 'ゴールに従ってタスクを開始してください。' });
    }

    const tools = req.tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: {
        type: 'object' as const,
        properties: Object.fromEntries(
          Object.entries(t.inputSchema).map(([key, description]) => [
            key,
            { type: 'string', description },
          ])
        ),
      },
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: req.maxTokens,
        system: req.system,
        messages,
        ...(tools.length > 0 ? { tools } : {}),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Anthropic API エラー (${response.status}): ${body.slice(0, 300)}`);
    }

    const data = (await response.json()) as {
      content: AnthropicContentBlock[];
      usage?: { input_tokens: number; output_tokens: number };
    };

    const toolUse = data.content.find((block) => block.type === 'tool_use');
    const textBlock = data.content.find((block) => block.type === 'text');

    return {
      text: toolUse ? undefined : textBlock?.text ?? '',
      toolCall: toolUse
        ? { name: toolUse.name ?? '', input: toolUse.input ?? {} }
        : undefined,
      tokensIn: data.usage?.input_tokens ?? 0,
      tokensOut: data.usage?.output_tokens ?? 0,
    };
  }
}

/** 環境に応じてプロバイダを選択 */
export function createProvider(): LLMProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) return new AnthropicProvider(apiKey);
  return new MockProvider();
}
