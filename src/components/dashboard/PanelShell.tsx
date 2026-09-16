// 大屏通用面板容器：科技边框 + 四角装饰 + 标题栏
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PanelShellProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export default function PanelShell({ title, subtitle, icon, actions, children, className, bodyClassName }: PanelShellProps) {
  return (
    <section className={cn('screen-panel corner-decor flex min-h-0 flex-col rounded-md', className)}>
      <header className="flex shrink-0 items-center gap-2 px-3 pt-2.5 pb-1.5">
        {icon && <span className="text-primary/90">{icon}</span>}
        <span className="title-vbar h-3.5 shrink-0" />
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <h3 className="font-serif-gov truncate text-[13px] font-semibold tracking-[1px] text-foreground">{title}</h3>
          {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </header>
      <div className="title-bar mx-3 h-px shrink-0 opacity-70" />
      <div className={cn('min-h-0 flex-1 p-2.5', bodyClassName)}>{children}</div>
    </section>
  );
}
