// 长丰街道热线诉求可视化大屏 · 主页面（1920x1080 等比缩放适配）
// 真实数据：RealDataProvider 每 60s 拉取 12345 热线工单接口并驱动全部模块
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useScaleScreen } from '@/hooks/useScaleScreen';
import { useLiveHazards } from '@/hooks/useLiveHazards';
import { RealDataProvider, useRealData } from '@/contexts/RealDataContext';
import { TimeFilterProvider } from '@/contexts/TimeFilterContext';
import { useFilteredData } from '@/hooks/useFilteredData';
import type { CityOpsEvent, HazardEvent } from '@/data/eventData';
import type { CommunityInfo } from '@/data/communities';
import { exportExcelReport, exportScreenPDF } from '@/lib/exportUtils';
import ScreenHeader from '@/components/dashboard/ScreenHeader';
import HotlineOverview from '@/components/dashboard/HotlineOverview';
import TimeFilterBar from '@/components/dashboard/TimeFilterBar';
import SatisfactionAnalysis from '@/components/dashboard/SatisfactionAnalysis';
import CityOpsEventDetail from '@/components/dashboard/CityOpsEventDetail';
import MapPanel from '@/components/dashboard/MapPanel';
import type { GlobalTabKey } from '@/components/dashboard/GlobalTabs';
import EmptyDashboard from '@/components/dashboard/EmptyDashboard';
import EconomyScreenEmbed from '@/components/dashboard/EconomyScreenEmbed';
import CaseMatcherModal from '@/components/dashboard/CaseMatcherModal';
import TrendPrediction from '@/components/dashboard/TrendPrediction';
import RealTimeEventTabs from '@/components/dashboard/RealTimeEventTabs';
import LeftPieTabs from '@/components/dashboard/LeftPieTabs';
import RightPieTabs from '@/components/dashboard/RightPieTabs';
import MonthlyTrend from '@/components/dashboard/MonthlyTrend';
import { WeeklyAnalysisProvider } from '@/contexts/WeeklyAnalysisContext';

/** 三列共用的固定行高（px）：三列按同一行网格排布，横向栏线才能对齐。
    行1 = 城运事件 / 趋势预测预警 / 实时事件（趋势预测预警行3 的结论双栏实测下限 256）。
    行2 = 构成分析（需容纳 8 行排行，实测下限 306）。
    地图与「报告·案例·督办」跨越行2、行3。 */
const ROW1 = 256;
const ROW2 = 306;
/** 顶部通栏 KPI 条高度（容纳旗帜标题行 + 环形图标 + 46px 数值，实测下限 122） */
const KPI_H = 124;

function DashboardScreenInner() {
  const { scale, offsetX, offsetY } = useScaleScreen();
  const { data, loading, error, lastUpdated } = useRealData();
  const liveHazards = useLiveHazards();
  const [selected, setSelected] = useState<CommunityInfo | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HazardEvent | null>(null);
  const [caseQuery, setCaseQuery] = useState<{ text: string; seq: number } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [globalTab, setGlobalTab] = useState<GlobalTabKey>('trend');
  const [matcherOpen, setMatcherOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [cityOpsDetail, setCityOpsDetail] = useState<CityOpsEvent | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  // 地图定位能力（由 MapPanel 初始化后注册，供城运事件弹窗「定位」按钮调用）
  const mapLocateRef = useRef<((lng: number, lat: number) => void) | null>(null);
  const registerMapLocate = useCallback((fn: (lng: number, lat: number) => void) => {
    mapLocateRef.current = fn;
  }, []);

  // 右侧实时事件列表：真实最新工单（首载前为空，遮罩覆盖后立即填充；跟随全局时间筛选）
  const recentEvents = useFilteredData()?.recentEvents ?? [];

  const handleSelect = useCallback((c: CommunityInfo | null) => setSelected(c), []);

  // 事件详情「关联相似案例」→ 右侧匹配引擎自动检索并打开弹窗
  const handleMatchCases = useCallback((text: string) => {
    setCaseQuery((q) => ({ text, seq: (q?.seq ?? 0) + 1 }));
    setMatcherOpen(true);
  }, []);

  // 高危事件列表点击 → 定位地图点位
  const handleLocateEvent = useCallback((e: HazardEvent) => {
    setSelectedEvent(e);
  }, []);

  const handleExportPDF = async () => {
    if (!screenRef.current || exporting) return;
    setExporting(true);
    try {
      await exportScreenPDF(screenRef.current);
      toast.success('大屏 PDF 已导出');
    } catch {
      toast.error('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    try {
      exportExcelReport(data);
      toast.success('数据报表 Excel 已导出');
    } catch {
      toast.error('导出失败，请重试');
    }
  };

  return (
    <div className="grid-bg relative min-h-screen w-full overflow-hidden bg-background">
      {/* 视觉重设计 Phase 1 · 全局背景特效层 */}
      <div className="bg-grid-layer anim-fade-in" />
      <div className="bg-vignette-layer" />
      <div className="bg-top-glow" />

      {/* 1920x1080 设计稿容器：transform-origin: top left 等比缩放并居中 */}
      <div
        ref={screenRef}
        className="absolute left-0 top-0 flex flex-col overflow-hidden bg-background"
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          /* willChange 提升为独立合成层：让 Chrome 按「缩放后」的比例栅格化文字，
             否则会先按 1x 绘制再整体缩放，导致整屏文字发虚（分数缩放时尤其明显） */
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          left: offsetX,
          top: offsetY,
        }}
      >
        {/* 顶部标题栏：单位信息 + 模块页签 + 中央标题 + 数据状态/时钟/导出（一行式） */}
        <ScreenHeader
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          exporting={exporting}
          activeTab={globalTab}
          onTabChange={setGlobalTab}
        />

        {globalTab === 'trend' ? (
          <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-2">
            {/* 顶部通栏：事件概览 KPI 条（环形图标 + 指标名 + 大号数值，等分铺满）
                统计周期筛选器嵌入其标题栏右侧 */}
            <div className="shrink-0" style={{ height: KPI_H }}>
              <HotlineOverview compact className="h-full" headerExtra={<TimeFilterBar compact />} />
            </div>

            {/* 三列按同一行网格对齐：行1 / 行2 为固定行高，三列横向栏线一致；
                中列为「地图（主视觉，跨行1+行2）+ 趋势预测预警（行3）」 */}
            <div className="flex min-h-0 flex-1 gap-2">
              {/* 左侧（21%）：城运事件 / 构成分析(Tab) / 问题结构分析(Tab) */}
              <div className="anim-slide-left flex w-[21%] shrink-0 flex-col gap-2">
                <div className="shrink-0" style={{ height: ROW1 }}>
                  <SatisfactionAnalysis className="h-full" />
                </div>
                <div className="shrink-0" style={{ height: ROW2 }}>
                  <RightPieTabs className="h-full" />
                </div>
                <LeftPieTabs className="min-h-0 flex-1" />
              </div>

              {/* 中央（53%）：地图（跨行1、行2，主视觉）+ 趋势预测预警（行3）
                  地图高度 = 行1 + 列间距 + 行2，使中列的横向栏线落在与左右列完全相同的 570px 处 */}
              <div className="anim-slide-up flex min-w-0 flex-1 flex-col gap-2">
                {/* flex：MapPanel 自身是 flex-1，包裹层需为 flex 容器它才能撑满固定高度 */}
                <div className="flex shrink-0" style={{ height: ROW1 + 8 + ROW2 }}>
                  <MapPanel
                    selected={selected}
                    onSelect={handleSelect}
                    selectedEvent={selectedEvent}
                    onSelectEvent={setSelectedEvent}
                    onMatchCases={handleMatchCases}
                    activeScenario={activeScenario}
                    registerLocate={registerMapLocate}
                  />
                </div>
                <div className="min-h-0 flex-1">
                  <TrendPrediction
                    activeScenario={activeScenario}
                    onScenarioChange={setActiveScenario}
                    className="h-full"
                  />
                </div>
              </div>

              {/* 右侧（26%）：实时事件（行1）+ 报告·案例·督办（跨行2、行3） */}
              <div className="anim-slide-right flex w-[26%] shrink-0 flex-col gap-2">
                <div className="shrink-0" style={{ height: ROW1 }}>
                  <RealTimeEventTabs
                    events={recentEvents}
                    liveEvents={liveHazards}
                    onLocate={handleLocateEvent}
                    onOpenCityOpsDetail={setCityOpsDetail}
                    className="h-full"
                  />
                </div>
                <MonthlyTrend className="min-h-0 flex-1" onLocate={handleLocateEvent} />
              </div>
            </div>
          </div>
        ) : globalTab === 'economy' ? (
          /* 经济大屏：内嵌外部系统（城运中心街道综合平台） */
          <div className="flex min-h-0 flex-1 px-3 pb-2">
            <EconomyScreenEmbed className="h-full w-full" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 px-3 pb-2">
            <EmptyDashboard title="街道人口分布" desc="该模块内容建设中，后续接入真实数据" />
          </div>
        )}

        {/* 底部通栏：数据来源落款（统计周期筛选已并入顶部「事件概览」标题栏） */}
        <div className="relative flex shrink-0 items-center justify-end px-4 py-1.5">
          <span className="panel-rule absolute inset-x-0 top-0" />
          <span className="text-[11px] tracking-[0.08em] text-muted-foreground/85">
            数据来源：武汉市民热线 12345 实时接口 · {data?.dataRange ?? '2024.11 - 2026.08'}
            {lastUpdated && ' · 已自动刷新'}
          </span>
        </div>

        {/* 首次加载真实数据遮罩（科技感加载动画） */}
        {loading && (
          <div className="absolute inset-0 z-[90] flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full border border-primary/40" />
              <span className="absolute inset-2 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <p className="text-sm font-medium tracking-[0.3em] text-primary">接入 12345 热线实时数据</p>
            <p className="text-xs text-muted-foreground">硚口区长丰街道 · 工单数据加载中，请稍候…</p>
          </div>
        )}

        {/* 数据刷新失败横幅（保留缓存数据展示） */}
        {error && !loading && (
          <div className="absolute bottom-3 left-3 z-40 rounded border border-risk-mid/50 bg-risk-mid/10 px-2.5 py-1 text-[10px] text-risk-mid backdrop-blur-sm">
            实时接口暂时不可达，正在展示缓存数据，系统将自动重试
          </div>
        )}

        {/* 城运事件详情弹窗（居中于整个大屏，尺寸放大便于后续扩展内容） */}
        <CityOpsEventDetail
          event={cityOpsDetail}
          onClose={() => setCityOpsDetail(null)}
          onLocate={(e) => mapLocateRef.current?.(e.lng, e.lat)}
        />
      </div>

      {/* 相似案例匹配引擎弹窗 */}
      <CaseMatcherModal open={matcherOpen} onClose={() => setMatcherOpen(false)} externalQuery={caseQuery} />
    </div>
  );
}

export default function DashboardScreen() {
  return (
    <RealDataProvider>
      <TimeFilterProvider>
        <WeeklyAnalysisProvider>
          <DashboardScreenInner />
        </WeeklyAnalysisProvider>
      </TimeFilterProvider>
    </RealDataProvider>
  );
}
