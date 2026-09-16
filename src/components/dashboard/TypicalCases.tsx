// 典型案例模块：真实已办结工单列表（市级编号 + 事项小类 + 真实诉求内容 + 真实办结结果），点击定位地图
// 数据来自 data.json 真实工单（已办结），办结结果展示真实「处理结果」与「办结单位」
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { FileText, Inbox } from 'lucide-react';
import { useRealData } from '@/contexts/RealDataContext';
import { buildRealClosedCases, closedResultText } from '@/services/dataService';
import type { HazardEvent } from '@/data/eventData';
import PanelShell from './PanelShell';

export default function TypicalCases({
  className,
  bare,
  onLocate,
}: {
  className?: string;
  bare?: boolean;
  onLocate?: (e: HazardEvent) => void;
}) {
  const { data: realData, realtimeOrders } = useRealData();
  // 真实已办结工单（按受理时间倒序，最新办结在前）；仅用实时接口工单，避免知识库历史（1.4 万条）涌入列表
  const cases = useMemo(
    () => buildRealClosedCases(realtimeOrders, realData?.hazardEvents ?? [], 'cases'),
    [realtimeOrders, realData],
  );

  const handleClick = (e: HazardEvent | null) => {
    if (e) onLocate?.(e);
  };

  const body = (
    <div className="h-full space-y-2 overflow-y-auto pr-1">
      {cases.length === 0 && (
        <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-center">
          <Inbox className="h-7 w-7 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">暂无已办结的典型案例</p>
        </div>
      )}
      {cases.map(({ order, event }, i) => {
        const sub = (order['事项小类'] || order['事项大类'] || '热线诉求').trim();
        const caseNo = (order['市级编号'] || order['办件编号'] || '').trim();
        const content = (order['诉求内容'] || order['诉求主题'] || '').trim();
        return (
          <motion.div
            key={order['办件编号'] || caseNo || i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(0.04 * i, 0.3) }}
            onClick={() => handleClick(event)}
            className="cursor-pointer rounded border border-border/25 bg-secondary/10 p-2 transition-colors hover:border-primary/40 hover:bg-[rgba(212,168,67,0.08)]"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="font-digital shrink-0 text-[11px] text-primary">{caseNo}</span>
              <span className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                {sub}
              </span>
              <span className="shrink-0 rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                已办结
              </span>
            </div>
            {/* 真实诉求内容 */}
            <p className="line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">{content}</p>
            {/* 真实办结结果：处理结果 + 办结单位 */}
            <p className="mt-1 rounded bg-success/8 px-1.5 py-1 text-[10px] leading-relaxed text-success/90">
              <span className="font-semibold">办结结果：</span>
              {closedResultText(order)}
            </p>
          </motion.div>
        );
      })}
    </div>
  );

  if (bare) {
    return <div className="flex h-full min-h-0 flex-col">{body}</div>;
  }

  return (
    <PanelShell title="典型案例" icon={<FileText className="h-4 w-4" />} className={className}>
      {body}
    </PanelShell>
  );
}
