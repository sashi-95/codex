'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Brain,
  MessageSquare,
  Shield,
  Database,
  Activity,
  Play,
  RotateCcw,
  XCircle,
  Terminal,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type {
  KernelSnapshot,
  ProcessInfo,
  ProcessState,
  KernelTask,
} from '@/agent-os/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PRESET_GOALS = [
  'AIエージェント導入によるカスタマーサポート改善の事業計画をまとめて',
  '来期のARR成長見通しを分析してレポートを作成して',
  '競合のAIエージェント戦略を調査して対応方針を提案して',
];

const STATE_STYLES: Record<ProcessState, { label: string; className: string }> = {
  ready: { label: 'READY', className: 'bg-status-info/20 text-status-info' },
  running: { label: 'RUNNING', className: 'bg-status-success/20 text-status-success animate-pulse' },
  waiting: { label: 'WAITING', className: 'bg-status-warning/20 text-status-warning' },
  terminated: { label: 'EXIT 0', className: 'bg-white/10 text-white/50' },
  failed: { label: 'FAILED', className: 'bg-status-error/20 text-status-error' },
};

const LEVEL_COLORS: Record<string, string> = {
  debug: 'text-white/40',
  info: 'text-status-info',
  warn: 'text-status-warning',
  error: 'text-status-error',
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ja-JP', { hour12: false });
}

function formatUptime(bootedAt: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - bootedAt) / 1000));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
}

/** 統計タイル */
function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <GlassCard className="p-4 flex items-center gap-4" hoverable={false}>
      <div className={cn('p-2.5 rounded-lg', accent)}>{icon}</div>
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-xl font-bold text-white font-mono">{value}</p>
      </div>
    </GlassCard>
  );
}

/** セクションカードの共通ヘッダー */
function SectionTitle({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {badge && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-mono">{badge}</span>
      )}
    </div>
  );
}

export default function AgentOSPage() {
  const { data, mutate } = useSWR<KernelSnapshot>('/api/agent-os/state', fetcher, {
    refreshInterval: 1000,
  });
  const [goal, setGoal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const submitTask = async (taskGoal: string) => {
    if (!taskGoal.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/agent-os/tasks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ goal: taskGoal }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'タスク投入に失敗しました');
      }
      setGoal('');
      await mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const killProcess = async (pid: number) => {
    await fetch('/api/agent-os/kill', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pid }),
    });
    await mutate();
  };

  const resetKernel = async () => {
    await fetch('/api/agent-os/reset', { method: 'POST' });
    await mutate();
  };

  const stats = data?.stats;
  const activeProcesses = data?.processes.filter(
    (p) => p.state !== 'terminated' && p.state !== 'failed'
  ).length ?? 0;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-accent-primary" />
            AI Agent OS
            <span className="text-sm font-normal text-white/40 mt-2">Mission Control</span>
          </h1>
          <p className="text-sm text-white/60">
            マルチエージェント・オーケストレーション基盤 — プロセス管理 / RAGメモリ / ガードレール / IPC
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats && (
            <div className="text-right text-xs text-white/50 font-mono">
              <p>provider: {stats.provider}</p>
              <p>uptime: {formatUptime(stats.bootedAt)} / ticks: {stats.ticks}</p>
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={resetKernel} icon={<RotateCcw className="w-4 h-4" />}>
            Reboot
          </Button>
        </div>
      </motion.div>

      {/* 統計 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={<Activity className="w-5 h-5 text-accent-primary" />}
          label="アクティブプロセス"
          value={activeProcesses}
          accent="bg-accent-primary/15"
        />
        <StatTile
          icon={<Zap className="w-5 h-5 text-accent-secondary" />}
          label="累計トークン"
          value={(stats?.totalTokens ?? 0).toLocaleString()}
          accent="bg-accent-secondary/15"
        />
        <StatTile
          icon={<Brain className="w-5 h-5 text-accent-tertiary" />}
          label="LLM呼び出し"
          value={stats?.totalLLMCalls ?? 0}
          accent="bg-accent-tertiary/15"
        />
        <StatTile
          icon={<Shield className="w-5 h-5 text-status-warning" />}
          label="ガードレール検知"
          value={data?.violations.length ?? 0}
          accent="bg-status-warning/15"
        />
      </div>

      {/* タスク投入 */}
      <GlassCard className="p-6" hoverable={false}>
        <SectionTitle
          icon={<Play className="w-4 h-4 text-accent-primary" />}
          title="タスク投入 — Orchestratorがサブエージェントに分解・委譲します"
        />
        <div className="flex gap-3">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitTask(goal)}
            placeholder="ゴールを入力 (例: AIエージェント導入の事業計画をまとめて)"
            className="flex-1 bg-background-tertiary border border-glass-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-primary/50"
          />
          <Button
            variant="primary"
            onClick={() => submitTask(goal)}
            loading={submitting}
            icon={<Play className="w-4 h-4" />}
          >
            実行
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {PRESET_GOALS.map((preset) => (
            <button
              key={preset}
              onClick={() => submitTask(preset)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-glass-border text-white/60 hover:text-white hover:border-accent-primary/50 transition-all"
            >
              {preset}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-status-error mt-3">⚠ {error}</p>}
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* プロセステーブル */}
        <GlassCard className="p-6 xl:col-span-2" hoverable={false}>
          <SectionTitle
            icon={<Cpu className="w-4 h-4 text-accent-primary" />}
            title="プロセステーブル"
            badge={`${data?.processes.length ?? 0} procs`}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/40 border-b border-glass-border">
                  <th className="pb-2 pr-4 font-medium">PID</th>
                  <th className="pb-2 pr-4 font-medium">AGENT</th>
                  <th className="pb-2 pr-4 font-medium">STATE</th>
                  <th className="pb-2 pr-4 font-medium">STEPS</th>
                  <th className="pb-2 pr-4 font-medium">TOKENS</th>
                  <th className="pb-2 pr-4 font-medium">ACTIVITY</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {(data?.processes ?? []).map((proc: ProcessInfo) => {
                    const agent = data?.agents.find((a) => a.id === proc.agentId);
                    const stateStyle = STATE_STYLES[proc.state];
                    const isAlive = proc.state !== 'terminated' && proc.state !== 'failed';
                    return (
                      <motion.tr
                        key={proc.pid}
                        className="border-b border-glass-border/50 text-white/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        title={proc.goal}
                      >
                        <td className="py-2.5 pr-4 font-mono text-white/50">
                          {proc.parentPid !== null && <span className="text-white/25">└ </span>}
                          {proc.pid}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: agent?.color ?? '#888' }}
                            />
                            {proc.name}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={cn('text-xs px-2 py-0.5 rounded font-mono', stateStyle.className)}>
                            {stateStyle.label}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-white/60">{proc.steps}</td>
                        <td className="py-2.5 pr-4 font-mono text-white/60">
                          {proc.tokensUsed.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-4 text-xs text-white/50 max-w-[200px] truncate">
                          {proc.currentActivity}
                        </td>
                        <td className="py-2.5">
                          {isAlive && (
                            <button
                              onClick={() => killProcess(proc.pid)}
                              className="text-white/30 hover:text-status-error transition-colors"
                              title="強制終了 (SIGKILL)"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {(data?.processes.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-white/30 text-sm">
                      プロセスなし — 上のフォームからタスクを投入してください
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* タスク & 結果 */}
        <GlassCard className="p-6" hoverable={false}>
          <SectionTitle
            icon={<CheckCircle2 className="w-4 h-4 text-accent-secondary" />}
            title="タスク"
            badge={`${data?.tasks.length ?? 0}`}
          />
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
            {(data?.tasks ?? []).map((task: KernelTask) => (
              <div
                key={task.id}
                className="border border-glass-border rounded-lg p-3 cursor-pointer hover:border-glass-border-hover transition-all"
                onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono text-white/40">{task.id}</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded font-mono',
                      task.status === 'completed' && 'bg-status-success/20 text-status-success',
                      task.status === 'running' && 'bg-status-info/20 text-status-info animate-pulse',
                      task.status === 'failed' && 'bg-status-error/20 text-status-error',
                      task.status === 'queued' && 'bg-white/10 text-white/50'
                    )}
                  >
                    {task.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-white/80 line-clamp-2">{task.goal}</p>
                {task.status === 'running' && (
                  <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTime(task.createdAt)} 開始
                  </p>
                )}
                {expandedTaskId === task.id && task.result && (
                  <pre className="mt-3 text-xs text-white/70 whitespace-pre-wrap bg-background-tertiary rounded-lg p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {task.result}
                  </pre>
                )}
                {expandedTaskId === task.id && task.error && (
                  <p className="mt-2 text-xs text-status-error">{task.error}</p>
                )}
              </div>
            ))}
            {(data?.tasks.length ?? 0) === 0 && (
              <p className="text-center text-white/30 text-sm py-8">タスク履歴なし</p>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* カーネルイベントログ */}
        <GlassCard className="p-6" hoverable={false}>
          <SectionTitle
            icon={<Terminal className="w-4 h-4 text-accent-primary" />}
            title="カーネルイベントログ (syslog)"
          />
          <div className="font-mono text-xs space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar bg-background-primary/60 rounded-lg p-3">
            {(data?.events ?? []).map((event) => (
              <div key={event.id} className="flex gap-2 leading-relaxed">
                <span className="text-white/30 shrink-0">{formatTime(event.timestamp)}</span>
                <span className={cn('shrink-0 w-14', LEVEL_COLORS[event.level])}>
                  [{event.level.toUpperCase()}]
                </span>
                <span className="text-accent-secondary/70 shrink-0">{event.source}:</span>
                <span className="text-white/70">{event.message}</span>
              </div>
            ))}
            {(data?.events.length ?? 0) === 0 && (
              <p className="text-white/30 py-4 text-center">イベントなし</p>
            )}
          </div>
        </GlassCard>

        {/* メッセージバス */}
        <GlassCard className="p-6" hoverable={false}>
          <SectionTitle
            icon={<MessageSquare className="w-4 h-4 text-accent-tertiary" />}
            title="メッセージバス (IPC)"
            badge={`${data?.messages.length ?? 0} msgs`}
          />
          <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
            {(data?.messages ?? []).map((message) => (
              <div key={message.id} className="border border-glass-border/50 rounded-lg p-2.5">
                <div className="flex items-center gap-2 text-xs font-mono mb-1">
                  <span className="text-accent-secondary">{message.from}</span>
                  <span className="text-white/30">→</span>
                  <span className="text-accent-primary">{message.to}</span>
                  <span className="ml-auto px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                    {message.topic}
                  </span>
                </div>
                <p className="text-xs text-white/60 line-clamp-3">{message.payload}</p>
              </div>
            ))}
            {(data?.messages.length ?? 0) === 0 && (
              <p className="text-white/30 py-4 text-center text-sm">メッセージなし</p>
            )}
          </div>
        </GlassCard>

        {/* 長期記憶 (RAG) */}
        <GlassCard className="p-6" hoverable={false}>
          <SectionTitle
            icon={<Database className="w-4 h-4 text-accent-secondary" />}
            title="長期記憶 — ベクトル検索ナレッジベース (RAG)"
            badge={`${data?.memory.length ?? 0} records`}
          />
          <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
            {(data?.memory ?? []).map((record) => (
              <div key={record.id} className="border border-glass-border/50 rounded-lg p-2.5">
                <div className="flex items-center gap-2 text-xs font-mono mb-1">
                  <span className="text-white/40">{record.id}</span>
                  <span className="text-accent-secondary/70">{record.source}</span>
                  <span className="ml-auto text-white/30">参照 {record.accessCount}回</span>
                </div>
                <p className="text-xs text-white/70">{record.content}</p>
                {record.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {record.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-accent-secondary/10 text-accent-secondary/70">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* ガードレール */}
        <GlassCard className="p-6" hoverable={false}>
          <SectionTitle
            icon={<Shield className="w-4 h-4 text-status-warning" />}
            title="ガードレール検知履歴"
            badge={`${data?.violations.length ?? 0}`}
          />
          <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
            {(data?.violations ?? []).map((violation) => (
              <div key={violation.id} className="border border-status-warning/20 rounded-lg p-2.5">
                <div className="flex items-center gap-2 text-xs font-mono mb-1">
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded',
                      violation.severity === 'high' && 'bg-status-error/20 text-status-error',
                      violation.severity === 'medium' && 'bg-status-warning/20 text-status-warning',
                      violation.severity === 'low' && 'bg-status-info/20 text-status-info'
                    )}
                  >
                    {violation.severity.toUpperCase()}
                  </span>
                  <span className="text-white/60">{violation.policy}</span>
                  <span className="ml-auto text-white/30">
                    PID {violation.pid} / {violation.action}
                  </span>
                </div>
                <p className="text-xs text-white/60">{violation.detail}</p>
              </div>
            ))}
            {(data?.violations.length ?? 0) === 0 && (
              <div className="text-center py-8">
                <Shield className="w-8 h-8 text-status-success/40 mx-auto mb-2" />
                <p className="text-white/30 text-sm">違反なし — 全プロセスがポリシー内で動作中</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
