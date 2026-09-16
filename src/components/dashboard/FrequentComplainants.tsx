// 右侧：高频投诉人监控 + 实时工单流
import { Radio, UserRound } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { FREQUENT_COMPLAINANTS, type IncomingOrder } from '@/data/mockData';
import PanelShell from './PanelShell';

interface FrequentComplainantsProps extends ComponentPropsWithoutRef<'div'> {
  feed: IncomingOrder[];
}

export default function FrequentComplainants({ feed, className }: FrequentComplainantsProps) {
  const total = FREQUENT_COMPLAINANTS.ge5;

  return (
    <PanelShell
      className={className}
      title="高频投诉人监控"
      subtitle="重点人员态势"
      icon={<UserRound className="h-4 w-4" />}
      actions={
        <span className="flex items-center gap-1 text-xs text-success">
          <Radio className="h-3 w-3 animate-pulse-glow" />
          实时
        </span>
      }
    >
      <div className="flex h-full min-h-0 gap-2">
        {/* 左：统计概览 */}
        <div className="flex w-[118px] shrink-0 flex-col gap-1.5">
          <div className="flex-1 rounded border border-risk-high/30 bg-risk-high/10 px-2 py-1.5">
            <p className="text-xs text-muted-foreground">投诉 ≥ 5 次</p>
            <p className="font-digital text-xl font-semibold leading-tight text-risk-high">{FREQUENT_COMPLAINANTS.ge5}</p>
            <p className="text-xs text-muted-foreground">人</p>
          </div>
          <div className="flex-1 rounded border border-risk-mid/30 bg-risk-mid/10 px-2 py-1.5">
            <p className="text-xs text-muted-foreground">投诉 ≥ 10 次</p>
            <p className="font-digital text-xl font-semibold leading-tight text-risk-mid">{FREQUENT_COMPLAINANTS.ge10}</p>
            <p className="text-xs text-muted-foreground">人（占 {Math.round((FREQUENT_COMPLAINANTS.ge10 / total) * 100)}%）</p>
          </div>
        </div>

        {/* 右：TOP 投诉人 + 实时流 */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="space-y-1">
            {FREQUENT_COMPLAINANTS.top.slice(0, 3).map((p) => (
              <div key={p.alias} className="flex items-center gap-1.5 rounded bg-secondary/30 px-2 py-1">
                <span className="w-9 shrink-0 text-xs text-foreground">{p.alias}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {p.mainIssue} · {p.community}
                </span>
                <span className="font-digital shrink-0 text-xs font-semibold text-risk-high">{p.times}次</span>
              </div>
            ))}
          </div>
          {/* 实时工单流 */}
          <div className="min-h-0 flex-1 overflow-hidden rounded border border-border/70 bg-background/50">
            <p className="border-b border-border/60 px-2 py-0.5 text-xs tracking-wide text-muted-foreground">最新工单接入</p>
            <div className="h-[calc(100%-18px)] overflow-hidden">
              {feed.slice(0, 4).map((o) => (
                <div key={o.id} className="flex items-center gap-1.5 border-b border-border/30 px-2 py-[3px] last:border-0">
                  <span className="font-digital shrink-0 text-xs text-primary">{o.time}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-foreground">{o.issue}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{o.community.replace('社区', '')}</span>
                </div>
              ))}
              {feed.length === 0 && <p className="px-2 py-2 text-center text-xs text-muted-foreground">等待接入…</p>}
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
