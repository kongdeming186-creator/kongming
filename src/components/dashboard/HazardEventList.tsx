// 右侧：实时事件列表面板（卡片含诉求主题行，模块固定 420px：标题 40px + 列表约 350px 可滚动 + 底部按钮）
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import PanelShell from './PanelShell';
import type { HazardEvent } from '@/data/eventData';

const PREVIEW_COUNT = 5;

interface HazardEventListProps {
  events: HazardEvent[]; // 静态当日实时事件（time 升序展示）
  liveEvents: HazardEvent[]; // 实时新增事件（最新在前，带「新增」标）
  onLocate: (e: HazardEvent) => void;
  onOpenMatcher: () => void;
  className?: string;
}

/** 办件状态 → 迷你标签（小圆点 + 文字） */
function StatusTag({ e }: { e: HazardEvent }) {
  const overdue = e.status && e.status.includes('未办结') && e.days > 30;
  let dot = 'bg-success';
  let text = '办结';
  let cls = 'text-success';
  if (overdue) {
    dot = 'bg-risk-high';
    text = '超时';
    cls = 'text-risk-high';
  } else if (e.status && e.status.includes('未办结')) {
    dot = 'bg-risk-mid';
    text = '未办';
    cls = 'text-risk-mid';
  }
  return (
    <span className={cn('flex shrink-0 items-center gap-1 rounded px-1 py-0.5 text-[9px] font-semibold', cls)} style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {text}
    </span>
  );
}

/** 事件卡片：第一行编号/大类/时间/状态，第二行诉求主题（单行截断），项高 64px */
export function EventCard({ e, isNew, onLocate }: { e: HazardEvent; isNew: boolean; onLocate: (e: HazardEvent) => void }) {
  const [open, setOpen] = useState(false);
  const riskDot = e.risk === 'high' ? 'bg-risk-high' : e.risk === 'mid' ? 'bg-risk-mid' : 'bg-success';
  const shortId = e.id.replace(/[-\s]/g, '').slice(-6);

  const toggle = () => setOpen((v) => !v);

  return (
    <div
      onClick={() => onLocate(e)}
      className={cn(
        'hre-item group flex min-h-16 cursor-pointer flex-col justify-center rounded border border-border/70 bg-secondary/25 px-2 py-1.5 transition-colors hover:bg-[rgba(212,168,67,0.08)]',
        isNew && 'animate-slide-in-right'
      )}
    >
      {/* 第一行：风险点 + 编号 + 大类 + 时间 + 状态 + 展开钮 */}
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', riskDot)} />
        <span className="font-digital shrink-0 text-[11px] font-semibold text-primary">{shortId}</span>
        <span className="shrink-0 rounded bg-primary/15 px-1 py-px text-[9px] text-primary">{e.category}</span>
        <span className="font-digital ml-auto shrink-0 text-[10px] text-muted-foreground">{e.time}</span>
        <StatusTag e={e} />
        <button
          type="button"
          onClick={(ev) => { ev.stopPropagation(); toggle(); }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-primary"
          aria-label={open ? '收起详情' : '展开详情'}
        >
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      {/* 第二行：诉求主题（金色，最多两行截断） */}
      <p className="mt-1 line-clamp-2 w-full text-xs leading-snug text-primary" title={e.content}>
        {e.content}
      </p>

      {/* 展开态：诉求全文 + 操作 */}
      {open && (
        <div className="mt-1.5 space-y-1 border-t border-border/40 pt-1.5" onClick={(ev) => ev.stopPropagation()}>
          <p className="text-[11px] leading-[1.45] text-foreground">{e.content}</p>
          {e.address && (
            <p className="text-[10px] leading-[1.45] text-muted-foreground">📍 {e.address}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="truncate text-[9.5px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {e.community} · {e.days} 天
            </span>
            <button
              type="button"
              onClick={() => onLocate(e)}
              className="shrink-0 rounded border border-primary/40 bg-primary/10 px-1.5 py-px text-[9px] font-medium text-primary transition-colors hover:bg-primary/20"
            >
              查看详情
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** 全屏待处理事件弹窗（900px 宽 / 80vh 高） */
function AllEventsModal({ events, total, onClose, onLocate }: { events: HazardEvent[]; total: number; onClose: () => void; onLocate: (e: HazardEvent) => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="screen-panel corner-decor flex h-[80vh] max-h-[80vh] w-[900px] max-w-[90vw] flex-col overflow-hidden rounded-lg border border-primary/40 shadow-[0_0_48px_rgba(212,168,67,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex shrink-0 items-center gap-2 px-5 pt-4 pb-2.5">
          <AlertTriangle className="h-5 w-5 shrink-0 text-risk-high" />
          <h3 className="text-xl font-bold tracking-wide text-foreground">待处理事件列表</h3>
          <span className="font-digital text-sm text-primary">（共 {total} 件）</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded border border-border/70 bg-secondary/40 text-muted-foreground transition-colors hover:border-risk-high/50 hover:text-risk-high"
            aria-label="关闭"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="title-bar mx-5 h-px shrink-0 opacity-70" />

        {/* 可滚动事件列表 */}
        <div className="hre-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto p-5">
          {events.map((e) => (
            <EventCard key={e.id} e={e} isNew={false} onLocate={onLocate} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function HazardEventList({ events, liveEvents, onLocate, onOpenMatcher, className }: HazardEventListProps) {
  const [showAll, setShowAll] = useState(false);

  // 只展示"待处理或正在处理"的事件：过滤掉"已办结"状态
  const isUnresolved = (e: HazardEvent) => !(e.status && e.status.includes('已办结'));
  const pendingEvents = events.filter(isUnresolved);
  const pendingLive = liveEvents.filter(isUnresolved);
  const highCount = pendingEvents.filter((e) => e.risk === 'high').length;

  // 默认只展示最新5条未办结事件（按受理时间倒序取前5）
  const previewEvents = useMemo(() => pendingEvents.slice(0, PREVIEW_COUNT), [pendingEvents]);
  const hasMore = pendingEvents.length > PREVIEW_COUNT;

  return (
    <PanelShell
      className={className}
      title="实时事件"
      subtitle={`待处理 ${pendingEvents.length + pendingLive.length} 件 · 高风险 ${highCount + pendingLive.filter((e) => e.risk === 'high').length} 件`}
      icon={<AlertTriangle className="h-4 w-4 text-risk-high" />}
      actions={
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded border border-success/40 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            实时接入中
          </span>
          <button
            type="button"
            onClick={onOpenMatcher}
            className="flex items-center gap-1 rounded border border-primary/50 bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/25"
          >
            <Search className="h-3 w-3" />
            案例匹配
          </button>
        </div>
      }
    >
      {/* 模块固定 420px：标题约 40px + 列表区约 350px（可滚动）+ 底部查看更多按钮 */}
      <div className="flex h-full min-h-0 flex-col gap-1.5">
        {/* 实时新增（固定顶部，最新在前） */}
        {pendingLive.length > 0 && (
          <div className="hre-scroll max-h-20 shrink-0 space-y-1 overflow-y-auto pr-0.5">
            {pendingLive.map((e) => (
              <EventCard key={e.id} e={e} isNew onLocate={onLocate} />
            ))}
          </div>
        )}

        {/* 预览事件（最新5条，可纵向滚动） */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {pendingEvents.length === 0 && pendingLive.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground/50">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-xs">当前暂无待处理事件</span>
            </div>
          ) : (
            <div className="hre-scroll h-full space-y-1.5 overflow-y-auto pr-0.5">
              {previewEvents.map((e, i) => (
                <EventCard key={`${e.id}-${i}`} e={e} isNew={false} onLocate={onLocate} />
              ))}
            </div>
          )}
        </div>

        {/* 查看更多按钮（底部） */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-auto flex shrink-0 items-center justify-center gap-1.5 rounded border border-primary/50 bg-[rgba(36,21,16,0.85)] px-3 py-1.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/20 hover:shadow-[0_0_12px_rgba(212,168,67,0.45)] active:scale-[0.98]"
          >
            查看更多（共 {pendingEvents.length} 件）
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 全部待处理事件弹窗 */}
      <AnimatePresence>
        {showAll && (
          <AllEventsModal
            events={pendingEvents}
            total={pendingEvents.length}
            onClose={() => setShowAll(false)}
            onLocate={onLocate}
          />
        )}
      </AnimatePresence>
    </PanelShell>
  );
}
