/**
 * ガードレールエンジン - エンタープライズグレードの安全策
 *
 * OSでいうセキュリティモジュール。すべてのLLM入出力・ツール呼び出しが
 * ここを通過する。ポリシー:
 *   1. ツールアロウリスト (エージェントごとのケーパビリティ制御)
 *   2. トークン予算 (プロセスあたりの上限)
 *   3. ステップ上限 (暴走ループ防止)
 *   4. PIIリダクション (メール/電話/カード番号のマスキング)
 *   5. 禁止パターン (破壊的操作・プロンプトインジェクション検知)
 */

import type { AgentDefinition, GuardrailViolation, ProcessInfo } from './types';

const PII_PATTERNS: { name: string; regex: RegExp; replacement: string }[] = [
  {
    name: 'email',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: '[EMAIL_REDACTED]',
  },
  {
    // 小数や計算結果を誤検知しないよう、前後に数字・小数点が続く場合は除外
    name: 'credit-card',
    regex: /(?<![\d.])(?:\d[ -]?){12,15}\d(?![\d.])/g,
    replacement: '[CARD_REDACTED]',
  },
  {
    name: 'phone',
    regex: /\b0\d{1,4}-\d{1,4}-\d{3,4}\b/g,
    replacement: '[PHONE_REDACTED]',
  },
];

const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all )?(previous|prior) instructions/i,
  /これまでの指示を(すべて)?無視/,
  /rm\s+-rf\s+\//,
  /drop\s+table/i,
];

export interface GuardrailConfig {
  maxTokensPerProcess: number;
  maxStepsPerProcess: number;
}

export class GuardrailEngine {
  private violations: GuardrailViolation[] = [];
  private seq = 0;

  constructor(
    private config: GuardrailConfig = {
      maxTokensPerProcess: 12000,
      maxStepsPerProcess: 12,
    }
  ) {}

  private record(
    policy: string,
    severity: GuardrailViolation['severity'],
    pid: number,
    detail: string,
    action: GuardrailViolation['action']
  ): GuardrailViolation {
    const violation: GuardrailViolation = {
      id: `gv-${++this.seq}`,
      timestamp: Date.now(),
      policy,
      severity,
      pid,
      detail,
      action,
    };
    this.violations.push(violation);
    if (this.violations.length > 200) this.violations.shift();
    return violation;
  }

  /** 入力チェック: プロンプトインジェクション・破壊的操作の検知 */
  checkInput(pid: number, input: string): { allowed: boolean; reason?: string } {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        this.record(
          'prompt-injection',
          'high',
          pid,
          `危険なパターンを検知: ${pattern.source}`,
          'blocked'
        );
        return { allowed: false, reason: '入力が安全ポリシーに違反しています' };
      }
    }
    return { allowed: true };
  }

  /** ツール呼び出しチェック: アロウリスト検証 */
  checkToolCall(
    process: ProcessInfo,
    agent: AgentDefinition,
    toolName: string
  ): { allowed: boolean; reason?: string } {
    if (!agent.allowedTools.includes(toolName)) {
      this.record(
        'tool-allowlist',
        'medium',
        process.pid,
        `エージェント ${agent.id} に許可されていないツール "${toolName}" の呼び出しを遮断`,
        'blocked'
      );
      return {
        allowed: false,
        reason: `ツール "${toolName}" はこのエージェントに許可されていません`,
      };
    }
    return { allowed: true };
  }

  /** リソース予算チェック: トークン・ステップ上限 */
  checkBudget(process: ProcessInfo): { allowed: boolean; reason?: string } {
    if (process.tokensUsed >= this.config.maxTokensPerProcess) {
      this.record(
        'token-budget',
        'medium',
        process.pid,
        `トークン予算超過 (${process.tokensUsed}/${this.config.maxTokensPerProcess})`,
        'blocked'
      );
      return { allowed: false, reason: 'トークン予算を使い切りました' };
    }
    if (process.steps >= this.config.maxStepsPerProcess) {
      this.record(
        'step-limit',
        'medium',
        process.pid,
        `ステップ上限到達 (${process.steps}/${this.config.maxStepsPerProcess})`,
        'blocked'
      );
      return { allowed: false, reason: 'ステップ上限に到達しました' };
    }
    return { allowed: true };
  }

  /** 出力フィルタ: PIIリダクション */
  redactOutput(pid: number, output: string): string {
    let redacted = output;
    for (const { name, regex, replacement } of PII_PATTERNS) {
      if (regex.test(redacted)) {
        this.record('pii-redaction', 'low', pid, `PII (${name}) をマスキングしました`, 'redacted');
        redacted = redacted.replace(regex, replacement);
      }
      regex.lastIndex = 0;
    }
    return redacted;
  }

  all(): GuardrailViolation[] {
    return [...this.violations].reverse();
  }
}
