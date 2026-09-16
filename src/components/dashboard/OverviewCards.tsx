// 左侧：总体概览指标卡
import { CheckCircle2, ClipboardList, Timer, TriangleAlert } from 'lucide-react';
import { OVERVIEW } from '@/data/mockData';
import { motion } from 'motion/react';

const CARDS = [
  { key: 'total', label: '累计办件', value: OVERVIEW.totalOrders.toLocaleString(), unit: '条', icon: ClipboardList, color: 'text-primary', border: 'border-primary/40', bg: 'bg-primary/10' },
  { key: 'resolve', label: '办结率', value: OVERVIEW.resolveRate.toFixed(2), unit: '%', icon: CheckCircle2, color: 'text-success', border: 'border-success/40', bg: 'bg-success/10' },
  { key: 'warn', label: '预警率', value: OVERVIEW.warnRate.toFixed(1), unit: '%', icon: TriangleAlert, color: 'text-risk-high', border: 'border-risk-high/40', bg: 'bg-risk-high/10' },
  { key: 'avg', label: '平均办理时长', value: OVERVIEW.avgDays.toFixed(1), unit: '天', icon: Timer, color: 'text-accent', border: 'border-accent/40', bg: 'bg-accent/10' }
];

export default function OverviewCards() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {CARDS.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className={`flex items-center gap-2 rounded border ${c.border} ${c.bg} px-2.5 py-2`}
        >
          <c.icon className={`h-4 w-4 shrink-0 ${c.color}`} />
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">{c.label}</p>
            <p className="font-digital text-lg leading-tight font-semibold text-foreground">
              {c.value}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">{c.unit}</span>
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
