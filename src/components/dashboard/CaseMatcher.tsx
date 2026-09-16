// 右侧：相似案例匹配引擎（输入新事件 → 匹配 TOP5 历史案例；支持地图事件详情联动检索）
// 案例库源自真实已办结工单（接口加载后覆盖静态快照）
import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Building2, Search, Timer } from 'lucide-react';
import { CASE_LIBRARY, type CaseRecord } from '@/data/mockData';
import { useRealData } from '@/contexts/RealDataContext';
import { matchCases } from '@/services/caseMatcher';
import PanelShell from './PanelShell';

interface CaseMatcherProps {
  className?: string;
  /** 外部联动检索（地图事件详情「关联相似案例」触发），seq 递增确保同文本可重复触发 */
  externalQuery?: { text: string; seq: number } | null;
  /** 仅渲染内容（不含 PanelShell），用于嵌入弹窗 */
  bare?: boolean;
}

export default function CaseMatcher({ className, externalQuery, bare = false }: CaseMatcherProps) {
  const { data } = useRealData();
  const library = data?.caseLibrary ?? CASE_LIBRARY;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(CaseRecord & { score: number })[]>([]);
  const [searched, setSearched] = useState(false);

  // 地图事件详情联动：外部查询变化时自动检索
  useEffect(() => {
    if (externalQuery?.text) {
      setQuery(externalQuery.text);
      setResults(matchCases(externalQuery.text, library));
      setSearched(true);
    }
  }, [externalQuery, library]);

  const doSearch = () => {
    setResults(matchCases(query, library));
    setSearched(true);
  };

  // 快捷词条基于真实高频小类生成
  const suggestions = useMemo(
    () => (data?.top10Issues ?? []).slice(0, 4).map((i) => i.name),
    [data]
  );

  const content = (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {/* 检索输入 */}
      <div className="flex shrink-0 gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary/70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            placeholder="输入事件描述 / 问题类型，检索相似历史案例"
            className="h-9 w-full rounded border border-primary/30 bg-secondary/30 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={doSearch}
          className="h-9 shrink-0 rounded border border-primary/50 bg-primary/20 px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary/30"
        >
          匹配
        </button>
      </div>

      {/* 快捷词条 */}
      <div className="flex shrink-0 flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuery(s);
              setResults(matchCases(s, library));
              setSearched(true);
            }}
            className="rounded border border-border/70 bg-secondary/30 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {s}
          </button>
        ))}
      </div>

      {/* 匹配结果列表 */}
      <div className="hre-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {!searched ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground/50">
            <Search className="h-6 w-6" />
            <span className="text-xs">真实办结工单库共 {library.length} 条，输入关键词开始匹配</span>
          </div>
        ) : results.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground/50">
            <Search className="h-6 w-6" />
            <span className="text-xs">未匹配到相似案例</span>
          </div>
        ) : (
          results.map((c) => (
            <div key={c.id} className="rounded border border-border/70 bg-secondary/25 px-2.5 py-2 transition-colors hover:border-primary/40">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-digital truncate text-sm font-semibold text-primary">{c.id}</span>
                <span className="rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">{c.category}</span>
                <span className="ml-auto font-digital shrink-0 text-sm font-bold text-success">{c.score}分</span>
              </div>
              <p className="line-clamp-5 text-sm leading-relaxed text-foreground">{c.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3 text-primary/70" />{c.dept}</span>
                <span className="flex items-center gap-1"><Timer className="h-3 w-3 text-primary/70" />{c.duration}天</span>
                <span className="flex items-center gap-1"><BadgeCheck className="h-3 w-3 text-success/80" />{c.community}</span>
                <span className="ml-auto">{c.date}</span>
              </div>
              <p className="mt-1 line-clamp-2 rounded bg-success/10 px-1.5 py-1 text-[11px] leading-relaxed text-success">{c.result}</p>
              {c.reply && (
                <p className="mt-1 rounded bg-primary/10 px-1.5 py-1 text-[11px] leading-relaxed text-primary/90">
                  <span className="font-semibold">回复：</span>{c.reply}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (bare) return content;

  return (
    <PanelShell className={className} title="相似案例匹配引擎" subtitle="新事件处置参考" icon={<Search className="h-4 w-4" />}>
      {content}
    </PanelShell>
  );
}
