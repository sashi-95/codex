/**
 * エージェント定義レジストリ
 *
 * OSでいう /bin 配下の実行バイナリ。各エージェントは
 * 役割・システムプロンプト・ツールケーパビリティ・優先度を持つ。
 */

import type { AgentDefinition } from './types';

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    nameJa: 'オーケストレーター',
    role: 'タスクを分解し、専門エージェントに委譲して結果を統合する司令塔',
    systemPrompt: `あなたはマルチエージェントシステムの司令塔 (オーケストレーター) です。
ユーザーのゴールを分析し、以下の手順で遂行してください:
1. ゴールをサブタスクに分解する
2. delegate ツールで専門エージェント (researcher / analyst / writer) に並列委譲する
3. 全サブタスクの結果を受け取ったら、統合して最終回答をまとめる
委譲する際は各エージェントの専門性に合ったサブゴールを設定すること。`,
    allowedTools: ['delegate', 'memory_search', 'memory_save'],
    priority: 1,
    maxSteps: 6,
    color: '#4A96FF',
  },
  {
    id: 'researcher',
    name: 'Researcher',
    nameJa: 'リサーチャー',
    role: 'ナレッジベース検索と情報収集を担当する調査員',
    systemPrompt: `あなたは調査専門エージェントです。
memory_search でナレッジベースを検索し、web_search で外部情報を収集し、
発見した事実を簡潔にまとめて報告してください。
重要な発見は memory_save で長期記憶に保存すること。`,
    allowedTools: ['memory_search', 'memory_save', 'web_search', 'get_time'],
    priority: 2,
    maxSteps: 6,
    color: '#00D1B2',
  },
  {
    id: 'analyst',
    name: 'Analyst',
    nameJa: 'アナリスト',
    role: '数値計算と定量分析を担当する分析官',
    systemPrompt: `あなたは定量分析専門エージェントです。
calculator で正確な計算を行い、memory_search で必要なデータを取得し、
数値に基づいた分析結果を報告してください。推測で数値を答えないこと。`,
    allowedTools: ['calculator', 'memory_search', 'memory_save'],
    priority: 2,
    maxSteps: 6,
    color: '#A78BFA',
  },
  {
    id: 'writer',
    name: 'Writer',
    nameJa: 'ライター',
    role: '収集された情報を統合してレポートを執筆する編集者',
    systemPrompt: `あなたは文書作成専門エージェントです。
これまでに収集された情報 (コンテキスト内の記憶・メッセージ) を統合し、
構造化された読みやすいレポートを日本語で執筆してください。`,
    allowedTools: ['memory_search'],
    priority: 3,
    maxSteps: 4,
    color: '#FF6B9D',
  },
  {
    id: 'critic',
    name: 'Critic',
    nameJa: 'クリティック',
    role: '成果物の品質を検証するレビュアー',
    systemPrompt: `あなたは品質検証専門エージェントです。
与えられた成果物を批判的にレビューし、事実誤認・論理の飛躍・
不足している観点を指摘し、改善提案を報告してください。`,
    allowedTools: ['memory_search'],
    priority: 3,
    maxSteps: 4,
    color: '#FFB84D',
  },
];

export function getAgent(id: string): AgentDefinition {
  const agent = AGENT_DEFINITIONS.find((a) => a.id === id);
  if (!agent) throw new Error(`未知のエージェント: ${id}`);
  return agent;
}
