// 相似案例匹配引擎：问题类型 / 关键词 / 社区 三维加权，返回 TOP5
import type { CaseRecord } from '@/data/mockData';

/** 简易相似度匹配：问题类型 / 关键词 / 社区 三维加权 */
export function matchCases(query: string, library: CaseRecord[]): (CaseRecord & { score: number })[] {
  const q = query.trim();
  if (!q || library.length === 0) return [];
  const words = [...new Set(q.split(/[\s,，。;；、]+/).filter((w) => w.length >= 2))];

  const scored = library.map((c) => {
    let score = 0;
    // 全文命中
    if (c.title.includes(q) || c.result.includes(q)) score += 30;
    // 分词命中（诉求摘要 / 类型 / 社区）
    for (const w of words) {
      if (c.title.includes(w)) score += 22;
      if (c.category.includes(w) || w.includes(c.category)) score += 26;
      if (c.community.includes(w)) score += 12;
      if (c.result.includes(w)) score += 8;
    }
    return { ...c, score: Math.min(score, 99) };
  }).filter((c) => c.score > 0);

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}