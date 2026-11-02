// 大屏通用面板容器：旗帜形标题条 + 斜切四角科技边框
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
    <section className={cn('screen-panel panel-sheen flex min-h-0 flex-col rounded-[2px]', className)}>
      {/* 四角斜切装饰 */}
      <span className="panel-cut panel-cut-tl" />
      <span className="panel-cut panel-cut-tr" />
      <span className="panel-cut panel-cut-bl" />
      <span className="panel-cut panel-cut-br" />

      {/* 标题行：旗帜形标题条（面板视觉锚点） */}
      <header className="relative flex shrink-0 items-center gap-2 px-2 pt-2 pb-1.5">
        <h3 className="panel-flag">
          {icon && <span className="relative shrink-0 text-white">{icon}</span>}
          <span className="relative truncate">{title}</span>
        </h3>
        {subtitle && <span className="label-muted ml-1 truncate">{subtitle}</span>}
        {actions && <div className="relative ml-auto shrink-0">{actions}</div>}
      </header>
      <div className="panel-rule mx-2 shrink-0" />
      <div className={cn('min-h-0 flex-1 p-2.5', bodyClassName)}>{children}</div>
    </section>
  );
}
