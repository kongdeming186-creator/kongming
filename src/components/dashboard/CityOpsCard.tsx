// 左侧：城运事件卡片（来源：区城运中心，独立于 12345 热线工单）
// 展示近两天城运事件列表，点击在屏幕中央打开城运事件详情弹窗
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { CITY_OPS_EVENTS } from '@/data/eventData';
import type { CityOpsEvent } from '@/data/eventData';

interface CityOpsCardProps {
  className?: string;
  /** 打开城运事件详情弹窗（居中于大屏） */
  onOpenDetail?: (e: CityOpsEvent) => void;
}

export default function CityOpsCard({ className, onOpenDetail }: CityOpsCardProps) {
  // 近两天城运事件（09-01 / 09-02），按上报时间倒序
  const events = CITY_OPS_EVENTS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className={`tech-card px-3 py-2.5 ${className ?? ''}`}
      style={{ backgroundColor: 'rgba(36,21,16,0.9)' }}
    >
      {/* 标题：白色加粗 + 左侧渐变红金竖条 */}
      <div className="mb-2 flex items-center gap-2">
        <span className="title-vbar h-3.5 shrink-0" />
        <h3 className="text-sm font-bold text-foreground">城运事件</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">近两日 {events.length} 条 · 来源：区城运中心</span>
      </div>

      {/* 近两天城运事件列表，点击可查看详情 */}
      <div className="space-y-1.5">
        {events.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => onOpenDetail?.(e)}
            className="mt-1 flex w-full items-start gap-2 rounded border border-orange-500/30 bg-orange-500/8 px-2.5 py-2 text-left transition-colors hover:bg-orange-500/15"
          >
            <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-400" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs">
                <span className="shrink-0 font-semibold text-orange-400">{e.tag}</span>
                <span
                  className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    e.dispatchStatus === '已结案' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                  }`}
                >
                  {e.dispatchStatus}
                </span>
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-snug text-foreground">{e.title}</p>
              <p className="mt-1 truncate font-digital text-[10px] text-muted-foreground">{e.reportTime} · 事件包ID {e.id}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
