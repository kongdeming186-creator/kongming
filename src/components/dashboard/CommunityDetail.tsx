// 地图下钻：社区详情浮层（TOP3 问题 + 核心指标 + 辖区重点区域）
import { motion, AnimatePresence } from 'motion/react';
import { Building2, X } from 'lucide-react';
import { RISK_LEVELS, type CommunityInfo } from '@/data/communities';
import { C } from '@/lib/chartTheme';

interface CommunityDetailProps {
  community: CommunityInfo | null;
  onClose: () => void;
}

export default function CommunityDetail({ community, onClose }: CommunityDetailProps) {
  return (
    <AnimatePresence>
      {community && (
        <motion.div
          key={community.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.28 }}
          className="absolute right-3 top-12 z-20 w-64 overflow-hidden rounded-md border border-border bg-background/95 shadow-2xl backdrop-blur-md"
        >
          {/* 标题栏 */}
          <div className="flex items-center gap-2 border-b border-border/70 bg-secondary/50 px-3 py-2">
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-foreground">{community.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">硚口区长丰街道</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-5 w-5 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="关闭详情"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 p-3">
            {/* 风险标识 */}
            <div className="flex items-center justify-between rounded border px-2 py-1.5" style={{ borderColor: `${RISK_LEVELS[community.riskLevel].color}55`, background: `${RISK_LEVELS[community.riskLevel].color}14` }}>
              <span className="text-sm" style={{ color: RISK_LEVELS[community.riskLevel].color }}>
                {RISK_LEVELS[community.riskLevel].label}
              </span>
              <span className="font-digital text-lg font-semibold" style={{ color: RISK_LEVELS[community.riskLevel].color }}>
                {community.riskScore}
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">分</span>
              </span>
            </div>

            {/* 核心指标 */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                ['累计工单', `${community.orders}`, '件'],
                ['环比变化', `${community.trend > 0 ? '+' : ''}${community.trend}`, '%'],
                ['办结率', `${community.resolveRate}`, '%'],
                ['平均时长', `${community.avgDays}`, '天']
              ].map(([label, value, unit]) => (
                <div key={label} className="rounded bg-secondary/40 px-2 py-1.5">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`font-digital text-sm font-semibold ${label === '环比变化' ? (community.trend > 0 ? 'text-risk-high' : 'text-success') : 'text-foreground'}`}>
                    {value}
                    <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* TOP3 问题特征 */}
            <div>
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground">TOP3 问题特征</p>
              <div className="space-y-1.5">
                {community.topIssues.map((issue, i) => (
                  <div key={issue.name} className="flex items-center gap-2">
                    <span className={`w-4 shrink-0 text-center font-digital text-xs font-semibold ${i === 0 ? 'text-risk-high' : i === 1 ? 'text-risk-mid' : 'text-primary'}`}>
                      {i + 1}
                    </span>
                    <span className="w-[68px] shrink-0 truncate text-xs text-foreground">{issue.name}</span>
                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded bg-secondary/60">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${Math.min(issue.ratio * 2, 100)}%`,
                          background: `linear-gradient(90deg, ${i === 0 ? '#ef4d4d' : i === 1 ? '#fbb03b' : C.primary}AA, ${
                            i === 0 ? '#ef4d4d' : i === 1 ? '#fbb03b' : C.primary
                          })`
                        }}
                      />
                    </div>
                    <span className="font-digital w-10 shrink-0 text-right text-xs font-semibold text-foreground">
                      {issue.count}件
                      <span className="ml-0.5 text-[8px] font-normal text-muted-foreground">{issue.ratio}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 辖区重点区域 */}
            <div>
              <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground">辖区重点区域</p>
              <div className="flex flex-wrap gap-1">
                {community.keyAreas.map((a) => (
                  <span key={a} className="rounded border border-border bg-secondary/40 px-1.5 py-0.5 text-xs text-foreground">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
