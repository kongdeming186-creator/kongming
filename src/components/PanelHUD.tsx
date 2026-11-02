// 可复用 HUD 面板：玻璃背景 + 四角 L 型角标（带呼吸 glow）+ 可选标题
import type React from 'react';
import { cn } from '@/lib/utils';

interface PanelHUDProps {
  children: React.ReactNode;
  className?: string;
  /** 角标/标题强调色，默认金色；预警模块可传红色 */
  accentColor?: string;
  title?: string;
}

export default function PanelHUD({ children, className, accentColor, title }: PanelHUDProps) {
  const style = accentColor
    ? ({ ['--corner-color' as string]: accentColor } as React.CSSProperties)
    : undefined;

  return (
    <div className={cn('panel-hud rounded-md', className)} style={style}>
      {/* 四角 L 型角标 */}
      <span className="panel-hud-corner panel-hud-corner-tl" />
      <span className="panel-hud-corner panel-hud-corner-tr" />
      <span className="panel-hud-corner panel-hud-corner-bl" />
      <span className="panel-hud-corner panel-hud-corner-br" />

      {/* 标题 */}
      {title && (
        <div className="panel-hud-title">
          <span className="panel-hud-title-bar" />
          <span className="panel-hud-title-icon" />
          <span className="panel-hud-title-text">{title}</span>
        </div>
      )}

      {children}
    </div>
  );
}