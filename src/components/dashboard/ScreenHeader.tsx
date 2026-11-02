// 大屏顶部一行式标题栏：左侧单位信息 + 模块页签，中央大标题（两侧尖角装饰），右侧数据状态 + 时钟 + 导出
import { FileSpreadsheet, FileText, Loader2, RefreshCw } from 'lucide-react';
import { useNowClock } from '@/hooks/useRealtimeFeed';
import { useRealData } from '@/contexts/RealDataContext';
import GlobalTabs, { type GlobalTabKey } from './GlobalTabs';

interface ScreenHeaderProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  exporting?: boolean;
  /** 当前大屏模块页签 */
  activeTab: GlobalTabKey;
  onTabChange: (k: GlobalTabKey) => void;
}

export default function ScreenHeader({ onExportPDF, onExportExcel, exporting, activeTab, onTabChange }: ScreenHeaderProps) {
  const now = useNowClock();
  const { data, refreshing, lastUpdated, refresh } = useRealData();
  const pad = (n: number) => String(n).padStart(2, '0');
  const week = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
  const dataRange = data?.dataRange ?? '2024.11 - 2026.08';

  return (
    <header className="relative flex h-16 shrink-0 items-center px-5">
      {/* 顶部宝蓝光晕 + 底部亮青分隔线 */}
      <div
        className="absolute inset-x-0 top-0 h-16 opacity-95"
        style={{
          background:
            'radial-gradient(55% 200% at 50% 0%, rgba(30,136,229,0.42) 0%, rgba(30,136,229,0.12) 45%, transparent 78%)'
        }}
      />
      <div className="panel-rule absolute inset-x-0 bottom-0" />
      <div className="absolute left-1/2 top-0 h-[3px] w-72 -translate-x-1/2 rounded-b bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_20px_rgba(0,229,255,0.8)]" />

      {/* 左侧：单位信息 + 模块页签 */}
      <div className="relative flex min-w-0 items-center gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[2px] border border-[#42A5F5]/60 bg-[#1E88E5]/20 text-[#4FF0FF]">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold tracking-[0.06em] text-white">武汉市硚口区长丰街道办事处</p>
            <p className="truncate text-[11px] text-muted-foreground">基层治理 · 市民热线诉求分析（{dataRange}）</p>
          </div>
        </div>
        <span className="h-9 w-px shrink-0 bg-gradient-to-b from-transparent via-[#42A5F5]/50 to-transparent" />
        <GlobalTabs active={activeTab} onChange={onTabChange} />
      </div>

      {/* 中央主标题：大号白色 + 冷光，两侧向内尖角 + 斜线刻痕装饰 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-center">
        <span className="header-deco-line" />
        <span className="header-deco-hatch" />
        <span className="header-deco-chevron" />
        <h1 className="glow-text font-serif-gov text-[31px] font-bold tracking-[0.1em] text-white">
          长丰街道热线诉求态势大屏
        </h1>
        <span className="header-deco-chevron l" />
        <span className="header-deco-hatch" />
        <span className="header-deco-line r" />
      </div>

      {/* 右侧：数据刷新状态 + 时钟 + 导出 */}
      <div className="relative ml-auto flex shrink-0 items-center gap-3">
        {/* 实时数据状态：60s 自动刷新 */}
        <button
          type="button"
          onClick={refresh}
          title={lastUpdated ? `最后更新 ${pad(lastUpdated.getHours())}:${pad(lastUpdated.getMinutes())}:${pad(lastUpdated.getSeconds())} · 点击立即刷新` : '点击立即刷新'}
          className={`flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1.5 text-[13px] transition-colors ${
            refreshing
              ? 'border-[#42A5F5]/60 bg-[#1E88E5]/20 text-[#4FF0FF]'
              : 'border-[#00E5FF]/50 bg-[#00E5FF]/10 text-[#4FF0FF] hover:bg-[#00E5FF]/20'
          }`}
        >
          {refreshing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              同步中
            </>
          ) : (
            <>
              <span className="green-breath h-2 w-2 rounded-full bg-[#00E5FF]" />
              实时接入中
              {lastUpdated && (
                <span className="font-digital text-[12px] text-muted-foreground">
                  {pad(lastUpdated.getHours())}:{pad(lastUpdated.getMinutes())}
                </span>
              )}
              <RefreshCw className="h-3 w-3 opacity-60" />
            </>
          )}
        </button>
        <div className="hidden items-baseline gap-2 lg:flex">
          <span className="font-digital text-[20px] font-bold text-white">
            {pad(now.getHours())}:{pad(now.getMinutes())}
            <span className="text-[15px] text-muted-foreground">:{pad(now.getSeconds())}</span>
          </span>
          <span className="text-[12px] text-muted-foreground">
            {now.getFullYear()}-{pad(now.getMonth() + 1)}-{pad(now.getDate())} 周{week}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onExportExcel}
            disabled={exporting}
            className="flex items-center gap-1 rounded-[2px] border border-[#42A5F5]/50 bg-[#1E88E5]/15 px-2.5 py-1.5 text-[13px] text-[#8FC7F0] transition-colors hover:bg-[#1E88E5]/30 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel
          </button>
          <button
            type="button"
            onClick={onExportPDF}
            disabled={exporting}
            className="flex items-center gap-1 rounded-[2px] border border-[#42A5F5]/50 bg-[#1E88E5]/15 px-2.5 py-1.5 text-[13px] text-[#8FC7F0] transition-colors hover:bg-[#1E88E5]/30 disabled:opacity-50"
          >
            <FileText className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>
      </div>
    </header>
  );
}
