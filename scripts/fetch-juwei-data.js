#!/usr/bin/env node
// 构建时拉取长丰街道「聚微事件」接口，聚合为静态 JSON 汇总文件 public/juwei_summary.json
// 说明：该接口返回的是历史数据（sendTime 截止 2025-10），仅用于大屏「聚微事件总量」等累计口径，
// 不参与「实时事件」模块（实时模块只认 12345 热线实时接口）。
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = 'https://uodcm-api.qiaokou.gov.cn/admin-api/dcm/wechat-message/list?tenantId=102';
const OUT = path.resolve(__dirname, '../public/juwei_summary.json');

/** 按字段分组计数，降序返回 {name,count}[] */
function tally(rows, field) {
  const map = new Map();
  for (const r of rows) {
    const key = String(r[field] ?? '').trim() || '(空)';
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

try {
  console.log('[fetch-juwei-data] 拉取聚微事件接口数据…');
  const res = await fetch(URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`接口请求失败 HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`接口返回异常 code=${json.code} msg=${json.msg ?? ''}`);
  // 兼容 data 直接为数组 / data.list 两种返回结构
  const rows = Array.isArray(json.data) ? json.data : (json.data?.list ?? []);
  if (!rows.length) throw new Error('接口未返回聚微事件数据');
  if (json.total && json.total !== rows.length) {
    console.warn(`[fetch-juwei-data] 注意：接口 total=${json.total} 但本次仅取回 ${rows.length} 条，可能存在分页`);
  }

  const months = new Map();
  let minTime = '';
  let maxTime = '';
  for (const r of rows) {
    const t = String(r.sendTime ?? '');
    if (t.length < 7) continue;
    const m = t.slice(0, 7);
    months.set(m, (months.get(m) ?? 0) + 1);
    if (!minTime || t < minTime) minTime = t;
    if (!maxTime || t > maxTime) maxTime = t;
  }

  const summary = {
    total: rows.length,
    generated_at: new Date().toLocaleString('zh-CN', { hour12: false }),
    time_range: { from: minTime.slice(0, 10), to: maxTime.slice(0, 10) },
    by_type: tally(rows, 'type'),
    by_label: tally(rows, 'label'),
    by_status: tally(rows, 'status'),
    by_dept: tally(rows, 'deptName'),
    by_month: [...months.entries()].sort().map(([name, count]) => ({ name, count })),
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const tmp = `${OUT}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(summary));
  fs.renameSync(tmp, OUT);
  console.log(
    `[fetch-juwei-data] ${summary.generated_at} 已写入聚微事件 ${rows.length} 条汇总（${summary.time_range.from} ~ ${summary.time_range.to}）→ ${OUT}`
  );
} catch (e) {
  console.error('[fetch-juwei-data] 失败:', e.message);
  process.exit(1);
}
