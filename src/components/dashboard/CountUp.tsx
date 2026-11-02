// 数字滚动组件：requestAnimationFrame 驱动，跨浏览器兼容（不依赖 CSS @property / counter）
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountUpProps {
  value: number;
  decimals?: number;
  group?: boolean;
  delay?: number;
  className?: string;
}

function formatGroup(n: number): string {
  const s = Math.abs(n).toString();
  const sign = n < 0 ? '-' : '';
  if (s.length <= 3) return sign + s;
  return sign + s.slice(0, -3) + ',' + s.slice(-3);
}

export default function CountUp({ value, decimals = 0, group = false, delay = 0, className }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    const startDelay = delay * 1000;
    const timer = setTimeout(() => {
      const duration = 1200;
      startRef.current = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(value * eased);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setDisplay(value);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    }, startDelay);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, delay]);

  const formatted = display.toFixed(decimals);
  const [intPart, decPart] = formatted.split('.');
  const intNum = parseInt(intPart, 10);
  const intStr = group ? formatGroup(intNum) : intPart;
  const fullStr = decPart ? `${intStr}.${decPart}` : intStr;

  return (
    <span className={cn('whitespace-nowrap', className)}>
      {value < 0 && '-'}{fullStr}
    </span>
  );
}