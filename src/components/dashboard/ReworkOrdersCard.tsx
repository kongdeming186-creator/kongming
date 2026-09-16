// 左侧：重办件统计卡片（基于历史工单数据，按诉求人+诉求内容相似度判定重复投诉 ≥2 次）
import { motion } from 'motion/react';
import { REWORK_ORDERS } from '@/data/mockData';

// TOP3 进度条颜色：第1名红 / 第2名橙 / 第3名黄
const BAR_COLORS = ['bg-risk-high', 'bg-risk-mid', 'bg-warning'];

export default function ReworkOrdersCard() {
  const { reworkTotal, ratio, top3, note } = REWORK_ORDERS;
  const maxPercent = Math.max(...top3.map((t) => t.percent));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="rounded border px-3 py-2.5"
      style={{ backgroundColor: 'rgba(36,21,16,0.92)', borderColor: 'rgba(212,168,67,0.18)' }}
    >
      {/* 标题：白色加粗 + 左侧 3px 红色竖线 */}
      <div className="mb-2 flex items-center gap-2">
        <span className="h-3.5 w-[3px] shrink-0 rounded-full bg-primary" />
        <h3 className="text-sm font-bold text-foreground">重办件</h3>
        <span className="ml-auto text-[9px] text-muted-foreground/70">{note}</span>
      </div>

      {/* 总量大数字 */}
      <div className="mb-2 flex items-baseline gap-1.5">
        <span className="font-digital text-2xl font-bold leading-none text-primary">{reworkTotal.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">重办件总量</span>
      </div>

      {/* TOP3 重办件类型：横向进度条 */}
      <div className="space-y-1.5">
        {top3.map((t, i) => (
          <div key={t.type} className="flex items-center gap-2">
            <span className="w-16 shrink-0 truncate text-xs text-foreground">{t.type}</span>
            <span className="font-digital w-10 shrink-0 text-right text-xs text-muted-foreground">{t.count}</span>
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary/40">
              <div
                className={`h-full rounded-full ${BAR_COLORS[i]}`}
                style={{ width: `${(t.percent / maxPercent) * 100}%` }}
              />
            </div>
            <span className="font-digital w-12 shrink-0 text-right text-xs text-muted-foreground">{t.percent}%</span>
          </div>
        ))}
      </div>

      {/* 底部：重办件占比 */}
      <p className="mt-2 text-[10px] text-muted-foreground">
        重办件占比 <span className="font-digital font-semibold text-primary">{ratio}%</span>
      </p>
    </motion.div>
  );
}