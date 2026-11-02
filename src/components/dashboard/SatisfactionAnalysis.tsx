// 市民热线满意度分析
// 数据说明：接口没有独立的满意度评价字段（实时接口「用户评价」列 518 条全为空，知识库无该列），
// 但 12345 的处理结果正文会写清办理轮次与不满意情况，例如：
//   「…第一次办理…第一次不满意原因：问题未解决。第二次办理…」
// 因此以「处理结果是否出现第二次办理」判定不满意重办件，并以事项小类聚合定位高发不满意问题。
// 口径跟随顶部全局统计周期；近 8 个月走势基于全量历史（跨周期）。
import { useMemo } from 'react';
import { Smile, ThumbsDown } from 'lucide-react';
import { useRealData } from '@/contexts/RealDataContext';
import { useTimeFilter, PERIOD_LABELS } from '@/contexts/TimeFilterContext';
import { stripCode } from '@/services/dataService';
import PanelShell from './PanelShell';

/** 处理结果正文里的重办标记 */
const REDO_MARK = '第二次办理';

/** 单个 KPI 小卡：大号数值 + 指标名 */
function Kpi({ label, value, unit, tone }: { label: string; value: number; unit: string; tone: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center rounded border border-[rgba(30,136,229,0.25)] bg-[rgba(16,69,127,0.5)] py-1">
      <p className="flex items-baseline gap-0.5 leading-none">
        <span className={`font-digital text-[22px] font-bold ${tone}`}>{value.toLocaleString()}</span>
        <span className="text-[11px] text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-0.5 w-full truncate px-1 text-center text-[11px] text-[#AEF4FC]">{label}</p>
    </div>
  );
}

export default function SatisfactionAnalysis({ className }: { className?: string }) {
  const { orders } = useRealData();
  const { timeRange, filterByTime } = useTimeFilter();

  /** 当前统计周期口径：以「有处理结果」的工单为满意度基数 */
  const stat = useMemo(() => {
    const inPeriod = timeRange === 'all' || !orders.length ? orders : filterByTime(orders);
    const withResult = inPeriod.filter((o) => String(o['处理结果'] ?? '').trim());
    const redoList = withResult.filter((o) => String(o['处理结果'] ?? '').includes(REDO_MARK));
    const base = withResult.length;
    const redo = redoList.length;

    // 高发不满意问题：事项小类去编号前缀后合并（'009.商业噪音问题' 与 '商业噪音问题' 视为同类）
    const map = new Map<string, number>();
    for (const o of redoList) {
      const k = stripCode(o['事项小类']) || '其他';
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    const top = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = top[0]?.[1] ?? 1;

    return {
      base,
      redo,
      satisfiedRate: base ? Math.round(((base - redo) / base) * 10000) / 100 : 0,
      redoRate: base ? Math.round((redo / base) * 10000) / 100 : 0,
      top: top.map(([name, count]) => ({ name, count, width: Math.max(8, Math.round((count / max) * 100)) })),
    };
  }, [orders, timeRange, filterByTime]);

  return (
    <PanelShell
      title="市民热线满意度分析"
      subtitle={`${PERIOD_LABELS[timeRange]}口径 · 样本 ${stat.base.toLocaleString()} 件`}
      icon={<Smile className="h-4 w-4" />}
      className={className}
    >
      <div className="flex h-full min-h-0 flex-col gap-1.5">
        {/* 三张 KPI：一次办结满意率 / 不满意重办 / 重办率 */}
        <div className="grid shrink-0 grid-cols-3 gap-1.5">
          <Kpi label="一次办结满意率" value={stat.satisfiedRate} unit="%" tone="text-success" />
          <Kpi label="不满意重办" value={stat.redo} unit="件" tone="text-risk-mid" />
          <Kpi label="重办率" value={stat.redoRate} unit="%" tone="text-risk-mid" />
        </div>

        {/* 高发不满意问题（按事项小类） */}
        <div className="flex min-h-0 flex-1 flex-col rounded border border-[rgba(30,136,229,0.25)] bg-[rgba(16,69,127,0.5)] px-2 py-1">
          <p className="table-head flex shrink-0 items-center gap-1 pb-0.5 text-[11px]">
            <ThumbsDown className="h-3 w-3 text-risk-mid" />
            高发不满意问题 TOP5
          </p>
          <div className="flex min-h-0 flex-1 flex-col justify-around">
            {stat.top.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">该周期内暂无不满意重办件</p>
            ) : (
              stat.top.map((it, i) => (
                <div key={it.name} className="flex items-center gap-1.5">
                  <span className="w-3 shrink-0 font-digital text-[10px] text-muted-foreground">{i + 1}</span>
                  <span className="w-[92px] shrink-0 truncate text-[11px] text-white" title={it.name}>
                    {it.name}
                  </span>
                  <span className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-[1px] bg-white/10">
                    <span
                      className="absolute inset-y-0 left-0 rounded-[1px]"
                      style={{ width: `${it.width}%`, background: 'linear-gradient(90deg,#FF5A5F,#FFB300)' }}
                    />
                  </span>
                  <span className="font-digital w-6 shrink-0 text-right text-[11px] font-bold text-[#FFB300]">
                    {it.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
