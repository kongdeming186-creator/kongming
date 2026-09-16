// 复现：merged_summary 加载失败 → 市民热线概览归零/显示"数据获取失败"
// 验收：失败时必须回退到内置兜底数据，页面显示 14,822 / 303 / 97.96
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import { loadMergedSummary } from '@/services/dataService';
import { RealDataProvider } from '@/contexts/RealDataContext';
import { TimeFilterProvider } from '@/contexts/TimeFilterContext';
import HotlineOverview from '@/components/dashboard/HotlineOverview';

// jsdom 不自动推进 requestAnimationFrame；同步执行使 CountUp 立即到达目标值
// 注意：本环境 performance.now() 会触发递归，改用固定递增时间戳
let rafTime = 0;
const raf = (cb: FrameRequestCallback) => {
  rafTime += 16;
  cb(rafTime);
  return 0;
};

describe('repro: merged_summary 加载失败时概览归零', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
    vi.stubGlobal('requestAnimationFrame', raf);
    // 本环境 performance.now() 会触发递归，mock 为固定递增值
    vi.stubGlobal('performance', { now: () => rafTime });
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('单元级：fetch 异常时 loadMergedSummary 必须返回兜底数据（14,822 口径）', async () => {
    const m = await loadMergedSummary();
    expect(m).not.toBeNull();
    expect(m?.total).toBe(14822);
    expect(m?.completed).toBe(14519);
    expect(m?.incomplete).toBe(303);
    expect(m?.completion_rate).toBe(97.96);
  });

  it('组件级：全部数据源失败时概览必须展示兜底真实数值而非 0/失败文案', async () => {
    render(
      <RealDataProvider>
        <TimeFilterProvider>
          <HotlineOverview />
        </TimeFilterProvider>
      </RealDataProvider>
    );
    await waitFor(
      () => {
        const html = document.body.innerHTML;
        // 不再显示失败占位
        expect(html).not.toContain('数据获取失败');
        // CountUp 渲染纯文本数字：总量 14,822（含千分位逗号）、未办结 303、办结率 97.96（整数与小数分 span 渲染）
        const kpiNums = [...html.matchAll(/kpi-num[^>]*>([^<]*)</g)].map((m) => m[1]);
        expect(kpiNums[0]).toBe('14,822');
        expect(kpiNums[1]).toBe('303');
        expect(kpiNums[2]).toBe('97');
      },
      { timeout: 5000, interval: 100 }
    );
  });

  it('边界：merged_summary 返回 404 时同样返回兜底数据', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    const m = await loadMergedSummary();
    expect(m).not.toBeNull();
    expect(m?.total).toBe(14822);
  });
});
