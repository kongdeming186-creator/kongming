// 右侧：典型案例 / 重点督办件 / 每周报告（内部 Tab 切换筛选，默认展示典型案例）
import { useState } from 'react';
import { CalendarRange, FileText, ShieldAlert } from 'lucide-react';
import type { HazardEvent } from '@/data/eventData';
import PanelShell from './PanelShell';
import WeeklyReport from './WeeklyReport';
import TypicalCases from './TypicalCases';
import KeySupervision from './KeySupervision';

type TabKey = 'report' | 'cases' | 'supervision';

interface ReportCaseTabsProps {
  className?: string;
  onLocate?: (e: HazardEvent) => void;
}

export default function ReportCaseTabs({ className, onLocate }: ReportCaseTabsProps) {
  const [active, setActive] = useState<TabKey>('cases');

  return (
    <PanelShell title="报告 · 案例 · 督办" icon={<FileText className="h-4 w-4" />} className={className}>
      <div className="flex flex-col gap-2">
        {/* Tab 切换栏（固定不动） */}
        <div className="flex shrink-0 gap-4 border-b border-border/60">
          {[
            { key: 'cases' as TabKey, label: '典型案例', icon: FileText },
            { key: 'supervision' as TabKey, label: '重点督办件', icon: ShieldAlert },
            { key: 'report' as TabKey, label: '每周报告', icon: CalendarRange },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className="flex items-center gap-1.5 border-b-2 pb-1.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: isActive ? '#d4a843' : 'transparent',
                  color: isActive ? '#d4a843' : 'rgba(255,245,230,0.55)',
                }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: isActive ? '#d4a843' : 'rgba(255,245,230,0.55)' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 内容区：撑满面板剩余高度，列表内部滚动 */}
        <div key={active} className="animate-tab-in flex min-h-0 flex-1 flex-col overflow-hidden">
          {active === 'report' ? (
            <WeeklyReport bare />
          ) : active === 'cases' ? (
            <TypicalCases bare onLocate={onLocate} />
          ) : (
            <KeySupervision bare onLocate={onLocate} />
          )}
        </div>
      </div>
    </PanelShell>
  );
}