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
import CityOpsCard from '@/components/dashboard/CityOpsCard';
import CityOpsEventDetail from '@/components/dashboard/CityOpsEventDetail';
import MapPanel from '@/components/dashboard/MapPanel';
import GlobalTabs, { type GlobalTabKey } from '@/components/dashboard/GlobalTabs';
import EmptyDashboard from '@/components/dashboard/EmptyDashboard';
import CaseMatcherModal from '@/components/dashboard/CaseMatcherModal';
import TrendPrediction from '@/components/dashboard/TrendPrediction';
import RealTimeEventTabs from '@/components/dashboard/RealTimeEventTabs';
import LeftPieTabs from '@/components/dashboard/LeftPieTabs';
import RightPieTabs from '@/components/dashboard/RightPieTabs';
import ReportCaseTabs from '@/components/dashboard/ReportCaseTabs';
import { WeeklyAnalysisProvider } from '@/contexts/WeeklyAnalysisContext';

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
          left: offsetX,
          top: offsetY,
        }}
      >
        {/* 顶部标题栏 */}
        <ScreenHeader onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} exporting={exporting} />

        {/* 全局页签栏：3 个大屏页签 */}
        <GlobalTabs active={globalTab} onChange={setGlobalTab} />

        {globalTab === 'trend' ? (
          <>
            {/* 主体三列（无底部面板，地图纵向延伸至底）：左面板 / 中央地图 / 右面板 */}
            <div className="flex min-h-0 flex-1 gap-2 px-3 pb-3">
              {/* 左侧面板（22%）：时间筛选 / 城运事件 / 构成分析(Tab) / 问题结构分析(Tab) */}
              <div className="anim-slide-left flex w-[22%] shrink-0 flex-col gap-2 overflow-y-auto pr-1">
                <TimeFilterBar />
                <CityOpsCard className="shrink-0" onOpenDetail={setCityOpsDetail} />
                <div className="module-sep" />
                <RightPieTabs className="shrink-0" />
                <div className="module-sep" />
                <LeftPieTabs className="shrink-0" />
              </div>

              {/* 中央（50%）：KPI概览 + 趋势预警 + 地图 */}
              <div className="anim-slide-up flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="shrink-0">
                  <HotlineOverview compact />
                </div>
                <div className="shrink-0">
                  <TrendPrediction activeScenario={activeScenario} onScenarioChange={setActiveScenario} />
                </div>
                <div className="module-sep" />
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

              {/* 右侧面板（28%）：实时事件Tab / 报告·案例·督办Tab（撑满剩余高度） */}
              <div className="anim-slide-right flex w-[28%] shrink-0 flex-col gap-2 overflow-hidden pr-1">
                <RealTimeEventTabs
                  events={recentEvents}
                  liveEvents={liveHazards}
                  onLocate={handleLocateEvent}
                  className="shrink-0"
                />
                <div className="module-sep shrink-0" />
                <ReportCaseTabs className="min-h-0 flex-1" onLocate={handleLocateEvent} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 px-3 pb-3">
            <EmptyDashboard
              title={globalTab === 'economy' ? '经济分析地图' : '街道人口分布'}
              desc="该模块内容建设中，后续接入真实数据"
            />
          </div>
        )}

        {/* 左下角落款 */}
        <div className="absolute bottom-3 right-4 text-[9px] tracking-widest text-muted-foreground/60">
          数据来源：武汉市民热线 12345 实时接口 · 统计周期 {data?.dataRange ?? '2024.11 - 2026.08'}
          {lastUpdated && ' · 已自动刷新'}
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
