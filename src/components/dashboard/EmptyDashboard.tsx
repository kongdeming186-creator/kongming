// 占位大屏：经济分析地图 / 街道人口分布（内容建设中，后续填充）
import { Construction } from 'lucide-react';

interface EmptyDashboardProps {
  title: string;
  desc?: string;
}

export default function EmptyDashboard({ title, desc }: EmptyDashboardProps) {
  return (
    <div className="screen-panel corner-decor animate-tab-in flex min-h-0 flex-1 flex-col items-center justify-center gap-4 rounded-md">
      <div className="grid h-20 w-20 place-items-center rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_32px_rgba(212,168,67,0.18)]">
        <Construction className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{desc ?? '该模块内容建设中，敬请期待'}</p>
      </div>
      <div className="mt-2 flex items-center gap-2 rounded border border-border/70 bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        数据接口预留中 · 后续接入真实数据
      </div>
    </div>
  );
}