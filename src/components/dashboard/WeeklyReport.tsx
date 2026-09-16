// 每周报告：近 8 周自然周周报（真实数据，随事件接口自动更新）
// 右侧面板仅展示周次列表；点击周次 → Word 公文格式大弹窗（Portal 居中于整个页面）
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarRange, ChevronRight, FileBarChart, FileText, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWeeklyReports, WEEK_COUNT, type WeeklyReportData, type WeeklyStatRow } from '@/hooks/useWeeklyReports';
import PanelShell from './PanelShell';

/* ============================== 周报大弹窗（Word 公文风格） ============================== */

/** 增减描述：环比/同比文段 */
const changeText = (pct: number | null): string => {
  if (pct === null) return '上年同期无数据';
  if (pct === 0) return '持平';
  return pct > 0 ? `增长${pct}%` : `下降${Math.abs(pct)}%`;
};

/** 政务表格（表1/表2） */
function GovTable({ caption, rows, total }: { caption: string; rows: WeeklyStatRow[]; total: number }) {
  if (rows.length === 0) return null;
  return (
    <div className="my-3 break-inside-avoid">
      <p className="mb-1.5 text-center text-[16px] font-bold text-[#1a1a1a]">{caption}</p>
      <table className="w-full border-collapse border border-[#444] text-[15px] text-[#1a1a1a]">
        <thead>
          <tr className="bg-[#e8e2d0]">
            <th className="border border-[#444] px-2 py-1.5 font-semibold">名称</th>
            <th className="border border-[#444] px-2 py-1.5 font-semibold">件数</th>
            <th className="border border-[#444] px-2 py-1.5 font-semibold">占比</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="odd:bg-[#f2ecdc]">
              <td className="border border-[#444] px-2 py-1.5">{r.name}</td>
              <td className="border border-[#444] px-2 py-1.5 text-right tabular-nums">{r.count}</td>
              <td className="border border-[#444] px-2 py-1.5 text-right tabular-nums">{r.pct}%</td>
            </tr>
          ))}
          <tr className="bg-[#e8e2d0] font-bold">
            <td className="border border-[#444] px-2 py-1.5">合计</td>
            <td className="border border-[#444] px-2 py-1.5 text-right tabular-nums">{total}</td>
            <td className="border border-[#444] px-2 py-1.5 text-right tabular-nums">100.0%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** 公文段落（首行缩进 2 字符） */
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2.5 text-justify text-[17px] leading-[2] text-[#1a1a1a] indent-[2em]">{children}</p>
);

/** 章节标题 */
const H = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2 mt-1 text-[20px] font-bold leading-[1.8] text-[#1a1a1a]">{children}</p>
);

/** 生成六、下一步工作措施（基于真实 TOP 问题/区域/未办结自动生成） */
function genMeasures(r: WeeklyReportData): { title: string; text: string }[] {
  const m: { title: string; text: string }[] = [];
  const top = r.topIssues[0];
  if (top && top.count > 0) {
    m.push({
      title: `强化「${top.name}」高频问题源头治理`,
      text: `针对本周排名首位的${top.name}类诉求（${top.count}件、占${top.pct}%），组织责任科室逐件核查办理情况，对重复投诉点位实行专人盯办、动态销号，提高首次办理质量，防止问题反弹回潮。`
    });
  }
  if (r.incomplete > 0) {
    m.push({
      title: '加快未办结件办理进度',
      text: `对本周尚未办结的 ${r.incomplete} 件诉求逐件明确责任单位和办结时限${r.incompleteByUnit.length ? `，重点跟踪${r.incompleteByUnit.slice(0, 2).map((u) => u.name).join('、')}等办理量较大单位的办理时效` : ''}，推动按期办结、按期回复。`
    });
  }
  if (r.hotAreas.length > 0) {
    m.push({
      title: '加强热点区域巡查值守',
      text: `对本周诉求集中的${r.hotAreas.slice(0, 3).map((a) => `${a.name}（${a.count}件）`).join('、')}等区域，增派网格力量常态化巡查，提前介入矛盾排查化解，减少同类诉求再次发生。`
    });
  }
  m.push({
    title: '落实未诉先办预防机制',
    text: '结合本周诉求结构和高发区域分布，对可能集中爆发的物业管理、市容环境类问题前置介入、主动治理，推动从"接诉即办"向"未诉先办"转变。'
  });
  return m;
}

function WeeklyReportModal({ report, onClose }: { report: WeeklyReportData; onClose: () => void }) {
  const trendStr = report.trendWeeks.map((t) => `${t.label}${t.count}件`).join('、');
  const measures = genMeasures(report);
  const yoyBase = report.yoySameWeek > 0 ? report.yoySameWeek : report.yoyAvg;
  const yoyDesc = report.yoySameWeek > 0 ? '去年同期' : '去年同期5周均值';

  // Portal 渲染到 document.body：脱离父容器约束，居中适度大小展示
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-background/80 backdrop-blur-sm px-6 py-6"
      onClick={onClose}
    >
      <div
        className="corner-decor flex h-[82vh] w-[75vw] max-w-[1100px] flex-col overflow-hidden rounded-lg border border-primary/50 shadow-[0_0_60px_rgba(212,168,67,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗标题栏（深色） */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-primary/30 bg-[rgba(36,21,16,0.95)] px-5 py-3">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <h3 className="text-base font-bold tracking-wide text-foreground">每周分析报告 · {report.weekLabel}（{report.rangeLabel}）</h3>
          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {report.isCurrent ? '本周 · 进行中' : '自然周报告'}
          </span>
          <span className="ml-1 text-[10px] text-muted-foreground">数据来源：12345 热线</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded border border-border/70 bg-secondary/40 text-muted-foreground transition-colors hover:border-risk-high/50 hover:text-risk-high"
            aria-label="关闭周报"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 公文纸张（米白仿 Word 文档，滚动阅读） */}
        <div className="hre-scroll min-h-0 flex-1 overflow-y-auto bg-[#f8f4e9] px-12 py-8">
          <div className="mx-auto max-w-[900px] font-serif">
            {/* 标题 */}
            <h2 className="mb-2 text-center text-[26px] font-bold leading-relaxed tracking-wide text-[#8a1c1c]">
              长丰街道办事处关于{report.year}年第{report.weekNo}周市民热线群众诉求办理情况的报告
            </h2>
            <p className="mb-4 text-center text-[13px] text-[#5a5245]">（{report.fullRange}）</p>

            {/* 主送机关 + 引言 */}
            <p className="mb-2.5 text-[17px] font-bold text-[#1a1a1a]">区人民政府：</p>
            <P>现将{report.year}年第{report.weekNo}周我街道市民热线群众诉求办理情况报告如下。</P>

            {/* 一、总体情况 */}
            <H>一、总体情况</H>
            <P>
              {report.isCurrent ? '本周（截至报告生成时）' : '本周'}我街道共受理市民热线群众诉求{report.total}件，
              环比{report.prevTotal > 0 ? `${report.total >= report.prevTotal ? '增加' : '减少'}${Math.abs(report.total - report.prevTotal)}件、` : ''}
              {changeText(report.momPct)}，
              {yoyBase > 0 ? `同比${yoyDesc}（${yoyBase}件）${changeText(report.yoyPct)}，` : '上年同期无可比数据，'}
              日均受理{report.avgPerDay}件（统计{report.days}天）。
              本周已办结{report.completed}件、办结率{report.resolveRate}%，未办结{report.incomplete}件。
            </P>

            {/* 二、诉求类别及排名 */}
            <H>二、诉求类别及排名</H>
            {report.top3Categories.length > 0 ? (
              <P>
                从事项大类看，诉求集中在{report.top3Categories.join('、')}，三类合计占{report.top3Pct}%（见表1）。
              </P>
            ) : (
              <P>本周暂无受理诉求，事项大类分布待数据接入后展示。</P>
            )}
            <GovTable caption={`表1  ${report.year}年第${report.weekNo}周市民热线诉求事项大类统计表`} rows={report.categories} total={report.total} />
            {report.topIssues.length > 0 && (
              <P>
                从事项类型看，排名前五位的诉求依次为：{report.topIssues.filter((r) => r.name !== '其他事项').map((it) => `${it.name}${it.count}件（${it.pct}%）`).join('、')}，
                前五位合计{report.top5Total}件，占{report.top5Pct}%（见表2）。
              </P>
            )}
            <GovTable caption={`表2  ${report.year}年第${report.weekNo}周市民热线诉求事项类型前五位统计表`} rows={report.topIssues} total={report.total} />

            {/* 三、重点突出问题 */}
            <H>三、重点突出问题</H>
            {report.total === 0 ? (
              <P>本周受理量为零，无突出问题。</P>
            ) : (
              <>
                {report.topIssues[0] && report.topIssues[0].count > 0 && (
                  <P>
                    （一）{report.topIssues[0].name}类诉求居首位。本周共受理{report.topIssues[0].name}类诉求{report.topIssues[0].count}件，占{report.topIssues[0].pct}%，
                    {report.repeatTotal > 0 ? `其中同一内容重复投诉${report.repeatTotal}件${report.repeatGroups[0] ? `（集中在${report.repeatGroups[0].name}，${report.repeatGroups[0].count}件）` : ''}，属一事多诉，` : ''}
                    需持续关注办理质量，防止办而不结、反复投诉。
                  </P>
                )}
                {report.hotAreas.length > 0 && (
                  <P>
                    （二）热点区域诉求集中。本周{report.hotAreas[0].name}周边受理{report.hotAreas[0].count}件
                    {report.hotAreas.length > 1 ? `，其次为${report.hotAreas.slice(1, 3).map((a) => `${a.name}（${a.count}件）`).join('、')}` : ''}，
                    反映该区域相关矛盾较为集中，需加强巡查和源头化解。
                  </P>
                )}
                {report.incomplete > 0 ? (
                  <P>
                    （三）未办结件积压需关注。本周尚有{report.incomplete}件诉求未办结，办结率{report.resolveRate}%，
                    {report.incompleteByUnit.length > 0 ? `主要涉及${report.incompleteByUnit.slice(0, 3).map((u) => `${u.name}（${u.count}件）`).join('、')}，` : ''}
                    需逐件跟踪办理时限，防止超期。
                  </P>
                ) : (
                  <P>（三）办理时效总体良好。本周受理诉求已全部办结，办结率100%，无超期未办结事项。</P>
                )}
              </>
            )}

            {/* 四、办理质量情况 */}
            <H>四、办理质量情况</H>
            <P>（一）办结情况。本周受理的{report.total}件诉求中，已办结{report.completed}件，办结率{report.resolveRate}%。</P>
            <P>
              （二）未办结情况。本周未办结{report.incomplete}件
              {report.incompleteByUnit.length > 0 ? `，分布为${report.incompleteByUnit.map((u) => `${u.name}${u.count}件`).join('、')}，` : '，'}
              街道已依托办理平台逐件核查、跟踪办理时效和回复情况。
            </P>
            <P>
              （三）重复投诉情况。本周同一诉求内容重复投诉（一事多诉）{report.repeatTotal}件
              {report.repeatGroups.length > 0 ? `，集中在${report.repeatGroups.map((g) => `${g.name}（${g.count}件）`).join('、')}，` : '，'}
              已实行专人盯办、动态销号，未发生超期未办结事项。
            </P>
            {/* 重点案件（附：受理编号/类别/状态/内容） */}
            {report.keyCases.length > 0 && (
              <div className="mb-2.5 space-y-1.5 border-l-2 border-[#8a1c1c] pl-3">
                {report.keyCases.map((c) => (
                  <p key={c.id} className="text-[14px] leading-[1.9] text-[#3a3428]">
                    <span className="font-digital font-semibold text-[#8a1c1c]">〔{c.id}〕</span>
                    <span className="ml-1.5 rounded bg-[#e8e2d0] px-1 py-0.5 text-[12px]">{c.category}</span>
                    <span className={cn('ml-1 rounded px-1 py-0.5 text-[12px]', c.status.includes('已办结') ? 'bg-[#dcedc8] text-[#2e5b1e]' : 'bg-[#f5c6c6] text-[#8a1c1c]')}>{c.status}</span>
                    <span className="ml-2 text-[#5a5245]">{c.content}</span>
                  </p>
                ))}
              </div>
            )}

            {/* 五、趋势研判 */}
            <H>五、趋势研判</H>
            <P>
              从周度走势看，近{WEEK_COUNT}周诉求量依次为{trendStr}，
              {(() => {
                const arr = report.trendWeeks.map((t) => t.count);
                const last = arr[arr.length - 1];
                const first = arr[0];
                if (last > first) return '整体呈上升态势，需提前部署应对力量。';
                if (last < first) return '整体呈回落趋稳态势，治理成效初显。';
                return '整体运行平稳。';
              })()}
              {yoyBase > 0 ? `从同比看，本周诉求量较${yoyDesc}（${yoyBase}件）${changeText(report.yoyPct)}，` : '上年同期无可比数据，'}
              物业管理、市容环境类问题治理成效需持续巩固。
            </P>

            {/* 六、下一步工作措施 */}
            <H>六、下一步工作措施</H>
            {measures.map((m, i) => (
              <P key={m.title}>
                （{('一二三四五六'.charAt(i))}）{m.title}。{m.text}
              </P>
            ))}

            {/* 落款 */}
            <div className="mt-8 mb-4 text-right text-[17px] leading-[2.2] text-[#1a1a1a]">
              <p className="font-bold">长丰街道办事处</p>
              <p>{report.signDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ============================== 周报列表（点击直接打开大弹窗） ============================== */

export default function WeeklyReport({ className, bare }: { className?: string; bare?: boolean }) {
  const { reports, ready } = useWeeklyReports();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const selected = selectedIdx !== null ? (reports[selectedIdx] ?? null) : null;

  const body = (
    <>
      {/* 周报列表（最新在前，点击周次直接打开完整周报大弹窗） */}
      <div className="hre-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {reports.map((r) => (
          <button
            key={r.weekLabel}
            type="button"
            onClick={() => setSelectedIdx(reports.indexOf(r))}
            className="group flex w-full items-center gap-2.5 rounded border border-border/25 bg-secondary/10 px-2.5 py-2 text-left transition-colors hover:border-primary/50 hover:bg-primary/10"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border/40 bg-secondary/30 text-muted-foreground transition-colors group-hover:border-primary/60 group-hover:bg-primary/20 group-hover:text-primary">
              <FileBarChart className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-foreground">{r.weekLabel}</span>
                <span className="font-digital text-[10px] text-muted-foreground">{r.rangeLabel}</span>
                {r.isCurrent && <span className="rounded bg-success/15 px-1 py-0.5 text-[9px] font-semibold text-success">进行中</span>}
              </span>
              <span className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="font-digital font-semibold text-primary">{r.total}</span>件
                <span>已办结<span className="font-digital ml-0.5">{r.completed}</span></span>
                {r.incomplete > 0 && <span className="text-risk-high">未办结{r.incomplete}</span>}
              </span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary" />
          </button>
        ))}
        {!ready && reports.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            正在接入热线工单数据…
          </div>
        )}
        {reports.length > 0 && (
          <p className="pt-1 text-center text-[9px] text-muted-foreground/60">点击周次查看完整周报（Word 格式）</p>
        )}
      </div>

      {/* 完整周报大弹窗：Portal 渲染到 body，居中于整个页面 */}
      {selected && (
        <WeeklyReportModal report={selected} onClose={() => setSelectedIdx(null)} />
      )}
    </>
  );

  if (bare) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        {body}
      </div>
    );
  }

  return (
    <PanelShell
      title="每周分析报告"
      icon={<CalendarRange className="h-4 w-4" />}
      className={className}
    >
      {body}
    </PanelShell>
  );
}
