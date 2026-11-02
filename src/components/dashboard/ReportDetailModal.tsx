// 「报告 · 案例 · 督办」详情弹窗：三个页签（典型案例 / 重点督办件 / 每周报告）
// 用 Portal 挂到 body：大屏列含 transform 缩放与 overflow-hidden，就地渲染会被裁剪
// （与 RealTimeEventTabs 的详情弹窗做法一致）
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarRange, FileText, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HazardEvent } from '@/data/eventData';
import WeeklyReport from './WeeklyReport';
import TypicalCases from './TypicalCases';
import KeySupervision from './KeySupervision';

type TabKey = 'cases' | 'supervision' | 'report';

const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: 'cases', label: '典型案例', icon: FileText },
  { key: 'supervision', label: '重点督办件', icon: ShieldAlert },
  { key: 'report', label: '每周报告', icon: CalendarRange },
];

export default function ReportDetailModal({
  open,
  onClose,
  onLocate,
}: {
  open: boolean;
  onClose: () => void;
  onLocate?: (e: HazardEvent) => void;
}) {
  const [active, setActive] = useState<TabKey>('cases');

  if (!open) return null;

  /** 定位：先关弹窗再回到地图，避免弹窗遮挡定位结果 */
  const handleLocate = (e: HazardEvent) => {
    onClose();
    onLocate?.(e);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="screen-panel animate-modal-in flex h-[78vh] max-h-[78vh] w-[1180px] max-w-[92vw] flex-col overflow-hidden rounded-[2px] border border-primary/40 shadow-[0_0_48px_rgba(30,136,229,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="panel-cut panel-cut-tl" />
        <span className="panel-cut panel-cut-tr" />
        <span className="panel-cut panel-cut-bl" />
        <span className="panel-cut panel-cut-br" />

        {/* 标题栏 */}
        <div className="relative flex shrink-0 items-center gap-2.5 px-5 pt-4 pb-2.5">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <h3 className="panel-heading text-base tracking-[0.14em]">报告 · 案例 · 督办</h3>
          <span className="label-muted">典型案例 / 重点督办件 / 每周报告</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-[2px] border border-border/70 bg-secondary/40 text-muted-foreground transition-colors hover:border-risk-high/50 hover:text-risk-high"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="title-bar mx-5 h-px shrink-0 opacity-80" />

        {/* 页签 */}
        <div className="flex shrink-0 gap-5 border-b border-border/60 px-5 pt-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={cn('subtab', isActive && 'subtab-active')}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 内容区 */}
        <div key={active} className="animate-tab-in min-h-0 flex-1 overflow-hidden p-4">
          {active === 'report' ? (
            <WeeklyReport bare />
          ) : active === 'cases' ? (
            <TypicalCases bare onLocate={handleLocate} />
          ) : (
            <KeySupervision bare onLocate={handleLocate} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
