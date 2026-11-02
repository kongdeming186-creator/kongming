// 数据导出：Excel（多 Sheet 数据报表，真实数据优先）+ PDF（大屏整屏截图）
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  CATEGORY_PIE, DEPT_LOAD, FREQUENT_COMPLAINANTS, HIGH_RISK_TOP5, MONTHLY_TREND, OVERVIEW, TOP10_ISSUES
} from '@/data/mockData';
import { COMMUNITIES } from '@/data/communities';
import type { DashboardData } from '@/services/dataService';

const dateStamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
};

/** 导出 Excel 数据报表（真实接口数据优先，未加载时回退真实统计快照） */
export function exportExcelReport(report: DashboardData | null) {
  const wb = XLSX.utils.book_new();
  const all = report?.rangeStats.all;

  const overview = [
    ['长丰街道市民热线诉求数据报表'],
    ['统计周期', report?.dataRange ?? '2024.11 - 2026.08'],
    ['数据来源', '硚口区 12345 市民热线工单（实时接口）'],
    [],
    ['指标', '数值', '单位'],
    ['累计办件', all?.total ?? OVERVIEW.totalOrders, '条'],
    ['未办结', all?.unfinished ?? OVERVIEW.totalOrders - 226, '条'],
    ['办结率', all?.resolveRate ?? OVERVIEW.resolveRate, '%'],
    ['已超时（承诺时间已过且未办结）', report?.cityOps.overdue ?? 253, '条']
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overview), '总体概览');

  const top10 = report?.top10Issues ?? TOP10_ISSUES;
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['排名', '问题类型（事项小类）', '工单量（件）'],
      ...top10.map((it, i) => [i + 1, it.name, it.value])
    ]),
    'TOP10高频问题'
  );

  const pie = report?.categoryPie ?? CATEGORY_PIE;
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['事项大类', '占比（%）'],
      ...pie.map((it) => [it.name, it.value])
    ]),
    '事项大类占比'
  );

  const stats = report?.communityStats;
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['社区居委会', '累计工单量（件）', '近90天（件）', '风险评分', '风险等级', '办结率（%）', '平均在办天数', '环比（%）'],
      ...COMMUNITIES.map((c) => {
        const s = stats?.[c.name];
        return [
          c.fullName,
          s?.orders ?? c.orders,
          s?.recent90d ?? '-',
          s?.riskScore ?? c.riskScore,
          (s?.riskLevel ?? c.riskLevel) === 'high' ? '高风险' : (s?.riskLevel ?? c.riskLevel) === 'mid' ? '中风险' : '低风险',
          s?.resolveRate ?? c.resolveRate,
          s ? Math.round(s.avgPendingDays) : c.avgDays,
          s?.trend ?? c.trend
        ];
      })
    ]),
    '社区工单与风险'
  );

  const riskTop5 = report?.highRiskTop5 ?? HIGH_RISK_TOP5;
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['排名', '高风险区域', '所属社区', '风险评分（相对密度）'],
      ...riskTop5.map((r, i) => [i + 1, r.region, r.community, r.score])
    ]),
    '高风险区域TOP5'
  );

  const monthly = report?.monthlyTrend ?? MONTHLY_TREND;
  const monthlyAvg = report?.monthlyAvg ?? 23.9;
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['月份', '工单量（件）', '高于月均值'],
      ...monthly.map((m) => [m.month, m.value, m.value > monthlyAvg ? '是' : ''])
    ]),
    '月度趋势'
  );

  const dept = report?.categoryDist ?? DEPT_LOAD;
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['事项大类', '工单量（件）'],
      ...dept.map((d) => [d.name, d.value])
    ]),
    '事项大类分布'
  );

  const complainants = report?.complainants ?? FREQUENT_COMPLAINANTS;
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['投诉频次区间', '人数'],
      ['投诉≥5次', complainants.ge5],
      ['投诉≥10次', complainants.ge10],
      [],
      ['号码（脱敏）', '投诉次数', '主要问题', '所在社区'],
      ...complainants.top.map((p) => [p.alias, p.times, p.mainIssue, p.community])
    ]),
    '高频投诉人'
  );

  XLSX.writeFile(wb, `长丰街道热线诉求数据_${dateStamp()}.xlsx`);
}

/** 导出大屏整屏 PDF（html2canvas 截图方案，中文无字体依赖） */
export async function exportScreenPDF(el: HTMLElement, filename = `长丰街道热线诉求大屏_${dateStamp()}.pdf`) {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: '#060d1f',
    useCORS: true,
    logging: false
  });
  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const w = canvas.width / 2;
  const h = canvas.height / 2;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [w, h], compress: true });
  pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
  pdf.save(filename);
}
