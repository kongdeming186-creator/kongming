#!/usr/bin/env node
// 构建时拉取长丰街道 12345 热线工单 Excel 接口，解析为 JSON 静态文件 public/data.json
// 前端改为 fetch('/data.json') 加载，彻底规避浏览器跨域限制
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL =
  'https://uodcm-api.qiaokou.gov.cn/admin-api/event/event/export-excel-public?deptId=102';
const OUT = path.resolve(__dirname, '../public/data.json');

try {
  console.log('[fetch-real-data] 拉取接口数据…');
  // 15s 超时：接口挂起时中止请求，避免脚本进程悬挂（vite 启动侧另有 8s 等待兜底）
  const res = await fetch(URL, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`接口请求失败 HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const name = wb.SheetNames[0];
  if (!name) throw new Error('Excel 工作表为空');
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { raw: false, defval: '' });
  if (!rows.length) throw new Error('接口未返回工单数据');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  // 先写临时文件再原子替换，避免前端在写入瞬间读到半截 JSON
  const tmp = `${OUT}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(rows));
  fs.renameSync(tmp, OUT);
  console.log(`[fetch-real-data] ${new Date().toLocaleString()} 已写入 ${rows.length} 条工单 → ${OUT}`);
} catch (e) {
  console.error('[fetch-real-data] 失败:', e.message);
  process.exit(1);
}
