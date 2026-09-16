// 地图事件点位详情卡片（12345 热线工单）：完整诉求内容 + 报案地址 + 处置结果 + 关联相似案例（内联展开 TOP5 历史案例）
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BadgeCheck, Building2, ChevronDown, Link2, Timer, X } from 'lucide-react';
import { CATEGORY_COLORS, type HazardEvent } from '@/data/eventData';
import { useRealData } from '@/contexts/RealDataContext';
import { matchCases } from '@/services/caseMatcher';

interface EventDetailCardProps {
  event: HazardEvent | null;
  onClose: () => void;
  onMatchCases: (query: string) => void;
  /** 点击"定位"按钮：地图平移至事件点位 */
  onLocate?: () => void;
}

const RISK_TEXT = { high: '高风险', mid: '中风险', low: '低风险' } as const;
const RISK_CLASS = { high: 'text-risk-high', mid: 'text-risk-mid', low: 'text-success' } as const;

export default function EventDetailCard({ event, onClose, onMatchCases, onLocate }: EventDetailCardProps) {
  const { data } = useRealData();
  const [showCases, setShowCases] = useState(false);

  // 内联匹配 TOP5 历史案例（基于真实办结工单库）
  const cases = useMemo(() => (event ? matchCases(event.content, data?.caseLibrary ?? []) : []), [event, data?.caseLibrary]);

  const toggleCases = () => {
    setShowCases((v) => !v);
    if (event) onMatchCases(event.content);
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          // 右上锚定，宽度 520px；max-h 限制高度避免超出地图
          className="absolute right-3 top-2 z-50 w-[520px] max-w-[calc(100%-1.5rem)] overflow-hidden rounded-lg border border-primary/40 bg-background/95 shadow-[0_0_28px_rgba(0,0,0,0.55)] backdrop-blur-md"
        >
          {/* 标题栏 */}
          <div className="flex items-center gap-2.5 border-b border-border/70 bg-secondary/50 px-4 py-2.5">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
            >
              {event.category}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-digital truncate text-sm font-semibold text-foreground">{event.id}</p>
              <p className="truncate text-xs text-muted-foreground">{event.community} · {event.time} 上报</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="关闭事件详情"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[calc(100vh-160px)] space-y-3 overflow-y-auto p-4">
            {/* 风险标签行 */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-xs font-semibold ${RISK_CLASS[event.risk]} ${event.risk === 'high' ? 'bg-risk-high/15' : event.risk === 'mid' ? 'bg-risk-mid/15' : 'bg-success/15'}`}>
                {RISK_TEXT[event.risk]}
              </span>
              {event.status && (
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${event.status.includes('已办结') ? 'bg-success/15 text-success' : 'bg-risk-mid/15 text-risk-mid'}`}>
                  {event.status}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary/80" />
                {event.dept}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="h-3.5 w-3.5 text-primary/80" />
                {event.days} 天
              </span>
            </div>

            {/* 完整诉求内容 */}
            <div>
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground">完整诉求内容</p>
              <p className="rounded bg-secondary/40 px-3 py-2 text-[13px] leading-relaxed text-foreground">{event.content}</p>
            </div>

            {/* 报案地址 + 定位 */}
            <div>
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground">报案地址</p>
              <div className="flex items-center gap-2 rounded bg-secondary/40 px-3 py-2">
                <p className="min-w-0 flex-1 break-all text-[13px] leading-relaxed text-foreground">
                  {event.address || '暂无'}
                </p>
                <button
                  type="button"
                  onClick={onLocate}
                  className="flex shrink-0 items-center gap-1 rounded border border-blue-500/50 bg-blue-500/15 px-2 py-1 text-[11px] font-medium text-blue-400 transition-colors hover:bg-blue-500/25"
                >
                  定位
                </button>
              </div>
            </div>

            {/* 处置结果 */}
            <div>
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground">处置结果</p>
              <p className="rounded border border-success/30 bg-success/10 px-3 py-2 text-[13px] leading-relaxed text-success">
                {event.result}
              </p>
            </div>

            {/* 关联相似案例按钮 */}
            <button
              type="button"
              onClick={toggleCases}
              className="flex w-full items-center justify-center gap-2 rounded border border-primary/50 bg-primary/15 px-3 py-2 text-sm font-medium text-primary transition-all duration-150 hover:bg-primary/25 hover:shadow-[0_0_12px_rgba(212,168,67,0.35)] active:scale-[0.98]"
            >
              <Link2 className="h-4 w-4" />
              关联相似案例 · 匹配 TOP5 历史处置
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCases ? 'rotate-180' : ''}`} />
            </button>

            {/* 内联相似案例列表 */}
            <AnimatePresence>
              {showCases && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 overflow-hidden"
                >
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                    相似历史案例 {cases.length > 0 ? `（${cases.length} 条匹配）` : ''}
                  </p>
                  {cases.length === 0 ? (
                    <div className="rounded border border-border/60 bg-secondary/20 px-3 py-3 text-center text-xs text-muted-foreground/60">
                      未匹配到相似历史案例
                    </div>
                  ) : (
                    cases.map((c) => (
                      <div key={c.id} className="rounded border border-border/70 bg-secondary/25 px-3 py-2 transition-colors hover:border-primary/40">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-digital truncate text-xs font-semibold text-primary">{c.id}</span>
                          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">{c.category}</span>
                          <span className="ml-auto shrink-0 font-digital text-xs font-bold text-success">{c.score}分</span>
                        </div>
                        <p className="line-clamp-2 text-xs leading-relaxed text-foreground">{c.title}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><BadgeCheck className="h-3 w-3 text-success/80" />{c.community}</span>
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3 text-primary/70" />{c.dept}</span>
                          <span className="flex items-center gap-1"><Timer className="h-3 w-3 text-primary/70" />{c.duration}天</span>
                        </div>
                        <p className="mt-1 line-clamp-1 rounded bg-success/10 px-1.5 py-1 text-[10px] leading-relaxed text-success">{c.result}</p>
                        {c.reply && (
                          <p className="mt-1 line-clamp-2 rounded bg-primary/10 px-1.5 py-1 text-[10px] leading-relaxed text-primary/90">
                            <span className="font-semibold">回复：</span>{c.reply}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
