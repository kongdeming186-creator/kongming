// 大屏适配 Hook：以 1920x1080 设计稿为基准，按窗口等比缩放并居中
import { useEffect, useState } from 'react';

export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

export interface ScaleResult {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function useScaleScreen(designW = DESIGN_WIDTH, designH = DESIGN_HEIGHT): ScaleResult {
  const [result, setResult] = useState<ScaleResult>({ scale: 1, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const update = () => {
      const scale = Math.min(window.innerWidth / designW, window.innerHeight / designH);
      // transform-origin: top left，需手动计算居中偏移
      const offsetX = (window.innerWidth - designW * scale) / 2;
      const offsetY = (window.innerHeight - designH * scale) / 2;
      setResult({ scale, offsetX, offsetY });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [designW, designH]);

  return result;
}
