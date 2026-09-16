// 大屏顶部标题栏：街道名称 + 数据状态（60s 自动刷新）+ 时钟 + 导出操作
import { FileSpreadsheet, FileText, Loader2, RefreshCw } from 'lucide-react';
import { useNowClock } from '@/hooks/useRealtimeFeed';
import { useRealData } from '@/contexts/RealDataContext';

interface ScreenHeaderProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  exporting?: boolean;
}

export default function ScreenHeader({ onExportPDF, onExportExcel, exporting }: ScreenHeaderProps) {
  const now = useNowClock();
  const { data, refreshing, lastUpdated, refresh } = useRealData();
  const pad = (n: number) => String(n).padStart(2, '0');
  const week = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
  const dataRange = data?.dataRange ?? '2024.11 - 2026.08';

  return (
    <header className="relative flex h-14 shrink-0 items-center px-5">
      {/* 标题底纹 */}
      <div className="title-bar absolute inset-x-0 bottom-0 h-px" />
      <div
        className="absolute inset-x-0 top-0 h-14 opacity-90"
        style={{
          background:
            'radial-gradient(60% 180% at 50% 0%, rgba(212,168,67,0.14) 0%, rgba(212,168,67,0.03) 45%, transparent 75%)'
        }}
      />
      <div className="absolute left-1/2 top-0 h-1 w-56 -translate-x-1/2 rounded-b bg-gradient-to-r from-transparent via-[#d4a843] to-transparent shadow-[0_0_12px_rgba(212,168,67,0.55)]" />

      {/* 左侧：单位信息 */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded border border-primary/40 bg-primary/10 text-primary">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm tracking-widest text-muted-foreground">武汉市硚口区长丰街道办事处</p>
          <p className="truncate text-sm text-muted-foreground/80">基层治理 · 市民热线诉求分析（{dataRange}）</p>
        </div>
      </div>

      {/* 中央标题：两侧对称几何线条装饰 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3.5 text-center">
        <span className="header-deco-line" />
        <span className="header-deco-diamond" />
        <h1 className="glow-text font-serif-gov bg-gradient-to-r from-[#c41e24] via-[#d4a843] to-[#c41e24] bg-clip-text text-[30px] font-semibold tracking-[0.28em] text-transparent">
          长丰街道热线诉求态势大屏
        </h1>
        <span className="header-deco-diamond" />
        <span className="header-deco-line r" />
      </div>

      {/* 右侧：数据刷新状态 + 时钟 + 导出 */}
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {/* 实时数据状态：60s 自动刷新 */}
        <button
          type="button"
          onClick={refresh}
          title={lastUpdated ? `最后更新 ${pad(lastUpdated.getHours())}:${pad(lastUpdated.getMinutes())}:${pad(lastUpdated.getSeconds())} · 点击立即刷新` : '点击立即刷新'}
          className={`flex items-center gap-1.5 rounded border px-2 py-1 text-sm transition-colors ${
            refreshing
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-success/40 bg-success/10 text-success hover:bg-success/20'
          }`}
        >
          {refreshing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              同步中
            </>
          ) : (
            <>
              <span className="green-breath h-2 w-2 rounded-full bg-success" />
              实时接入中
              {lastUpdated && (
                <span className="font-digital text-xs text-muted-foreground">
                  {pad(lastUpdated.getHours())}:{pad(lastUpdated.getMinutes())}
                </span>
              )}
              <RefreshCw className="h-3 w-3 opacity-60" />
            </>
          )}
        </button>
        <div className="hidden items-baseline gap-2 lg:flex">
          <span className="font-digital text-lg font-semibold text-foreground">
            {pad(now.getHours())}:{pad(now.getMinutes())}
            <span className="text-muted-foreground">:{pad(now.getSeconds())}</span>
          </span>
          <span className="text-sm text-muted-foreground">
            {now.getFullYear()}-{pad(now.getMonth() + 1)}-{pad(now.getDate())} 周{week}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onExportExcel}
            disabled={exporting}
            className="flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-sm text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel
          </button>
          <button
            type="button"
            onClick={onExportPDF}
            disabled={exporting}
            className="flex items-center gap-1 rounded border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-sm text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
          >
            <FileText className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>
      </div>
    </header>
  );
}
