// 城运事件详情弹窗（来源：区城运中心，独立于 12345 热线工单）
// 双栏布局：左栏「事件详情」+ 右栏「处置调度」时间线，居中显示在地图区域
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Calendar,
  ClipboardList,
  Crosshair,
  FileText,
  Flame,
  Inbox,
  MapPin,
  Paperclip,
  Search,
  Send,
  Tag,
  X
} from 'lucide-react';
import { type CityOpsEvent, type CityOpsTimelineEntry } from '@/data/eventData';

interface CityOpsEventDetailProps {
  event: CityOpsEvent | null;
  onClose: () => void;
  /** 点击"定位"按钮：地图平移至事件点位 */
  onLocate?: (e: CityOpsEvent) => void;
}

const TABS = [
  { key: 'dispatch', label: '城运调度', icon: Send },
  { key: 'process', label: '处置过程', icon: ClipboardList },
  { key: 'apply', label: '申请信息', icon: Inbox },
  { key: 'instruct', label: '领导批示', icon: FileText }
] as const;

/** 研判结论标签配色 */
const RESULT_CLS: Record<NonNullable<CityOpsTimelineEntry['resultColor']>, string> = {
  warn: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
};

/** 状态标签配色 */
const STATUS_CLS: Record<string, string> = {
  研判: 'bg-blue-500/15 text-blue-400',
  签收: 'bg-cyan-500/15 text-cyan-400',
  初告: 'bg-orange-500/15 text-orange-400',
  续告: 'bg-violet-500/15 text-violet-400',
  派发: 'bg-amber-500/15 text-amber-400',
  小结: 'bg-teal-500/15 text-teal-400',
  结案审核: 'bg-emerald-500/15 text-emerald-400',
  办结: 'bg-emerald-500/15 text-emerald-400'
};

export default function CityOpsEventDetail({ event, onClose, onLocate }: CityOpsEventDetailProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>('dispatch');

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* 半透明遮罩：点击空白处关闭 */}
          <motion.div
            key={`${event.id}-mask`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-background/40 backdrop-blur-[1px]"
          />
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            // 居中于整个大屏（x/y 交给 motion 管理，避免 scale 动画覆盖 Tailwind translate）
            style={{ x: '-50%', y: '-50%' }}
            className="absolute left-1/2 top-1/2 z-50 flex max-h-[calc(100%-5rem)] w-[1200px] max-w-[calc(100%-4rem)] flex-col overflow-hidden rounded-lg border border-primary/40 bg-background/95 shadow-[0_0_32px_rgba(0,0,0,0.6)] backdrop-blur-md"
          >
            {/* 顶部：事件标签 + 标题 + 事件包ID/上报时间 */}
            <div className="flex shrink-0 items-start gap-3 border-b border-border/70 bg-secondary/50 px-4 py-3">
              <span className="mt-0.5 flex shrink-0 items-center gap-1 rounded bg-orange-500/20 px-2 py-0.5 text-[11px] font-bold text-orange-400 border border-orange-500/40">
                <Flame className="h-3 w-3" /> {event.tag}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-foreground">{event.title}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 font-digital text-[11px] text-muted-foreground">
                  <span>事件包ID：{event.id}</span>
                  <span>上报时间：{event.reportTime}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="关闭城运事件详情"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 双栏主体：高度自适应地图容器，左右栏独立滚动，确保内容完整可看 */}
            <div className="grid min-h-0 flex-1 grid-cols-[1fr_1.15fr] divide-x divide-border/60 overflow-hidden">
                {/* ===== 左栏：事件详情 ===== */}
                <div className="hre-scroll min-h-0 space-y-3 overflow-y-auto p-4">
                  <p className="flex items-center gap-1.5 border-b border-border/40 pb-2 text-xs font-bold tracking-wide text-primary">
                    <FileText className="h-3.5 w-3.5" /> 事件详情
                  </p>

                  {/* 事件地址 + 定位 */}
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-muted-foreground">事件地址</p>
                    <div className="flex items-center gap-2 rounded bg-secondary/40 px-2.5 py-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/80" />
                      <p className="min-w-0 flex-1 break-all text-xs leading-relaxed text-foreground">
                        {event.address}
                      </p>
                      <button
                        type="button"
                        onClick={() => onLocate?.(event)}
                        className="flex shrink-0 items-center gap-1 rounded border border-blue-500/50 bg-blue-500/15 px-2 py-1 text-[11px] font-medium text-blue-400 transition-colors hover:bg-blue-500/25"
                      >
                        <Crosshair className="h-3 w-3" /> 定位
                      </button>
                    </div>
                  </div>

                  {/* 关键词 */}
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-muted-foreground">关键词</p>
                    <div className="flex flex-wrap gap-1.5">
                      {event.keywords.map((k) => (
                        <span key={k} className="rounded bg-secondary/60 px-1.5 py-0.5 text-[11px] text-foreground/80">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 事件标签 */}
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-muted-foreground">事件标签</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {event.tags.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 rounded border border-blue-500/40 bg-blue-500/15 px-1.5 py-0.5 text-[11px] font-medium text-blue-400"
                        >
                          <Tag className="h-3 w-3" /> {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 事件描述 */}
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-muted-foreground">事件描述</p>
                    <div className="space-y-1.5 rounded bg-secondary/40 px-2.5 py-2">
                      {event.description.map((d, i) => (
                        <p key={i} className="text-xs leading-relaxed text-foreground">{d}</p>
                      ))}
                    </div>
                  </div>

                  {/* 附件 */}
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-muted-foreground">附件</p>
                    {event.attachments.length ? (
                      <div className="space-y-1">
                        {event.attachments.map((a) => (
                          <p key={a} className="rounded border border-border/60 px-2.5 py-1.5 text-xs text-primary">
                            {a}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="flex items-center gap-1.5 rounded border border-dashed border-border/60 px-2.5 py-2 text-xs text-muted-foreground/70">
                        <Paperclip className="h-3.5 w-3.5" /> 暂无附件
                      </p>
                    )}
                  </div>

                  {/* 调度信息（截图中位于左栏底部） */}
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 border-b border-border/40 pb-2 text-xs font-bold tracking-wide text-primary">
                      <Building2 className="h-3.5 w-3.5" /> 调度信息
                    </p>
                    <div className="space-y-1.5">
                      {(event.dispatchUnits ?? [{ org: event.dispatchOrg, status: event.dispatchStatus, time: event.dispatchTime }]).map((u) => (
                        <div
                          key={u.org}
                          className="flex items-center gap-2 rounded border border-border/60 bg-secondary/30 px-2.5 py-1.5"
                        >
                          <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{u.org}</span>
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              u.status === '已结案'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-orange-500/15 text-orange-400'
                            }`}
                          >
                            {u.status}
                          </span>
                          <span className="shrink-0 font-digital text-[10px] text-muted-foreground">{u.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ===== 右栏：处置调度 ===== */}
                <div className="flex min-h-0 flex-col p-4">
                  <div className="mb-2 flex items-center gap-1.5 border-b border-border/40 pb-2 text-xs font-bold tracking-wide text-primary">
                    <Send className="h-3.5 w-3.5" /> 处置调度
                  </div>

                  {/* Tab 栏 */}
                  <div className="mb-2.5 flex shrink-0 gap-1 rounded border border-border/60 bg-secondary/30 p-0.5">
                    {TABS.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActiveTab(t.key)}
                        className={`flex flex-1 items-center justify-center gap-1 rounded px-1 py-1 text-[11px] font-medium transition-colors ${
                          activeTab === t.key
                            ? 'bg-primary/20 text-primary shadow-[inset_0_0_0_1px_rgba(212,168,67,0.35)]'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <t.icon className="h-3 w-3" />
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab 内容：独立滚动 */}
                  <div className="hre-scroll min-h-0 flex-1 overflow-y-auto">
                    {activeTab === 'dispatch' && (
                      <div className="space-y-0">
                        {event.timeline.map((t, i) => (
                          <div key={i} className="relative flex gap-2.5 pb-3">
                            {i < event.timeline.length - 1 && (
                              <span className="absolute left-[5px] top-3.5 h-[calc(100%-6px)] w-px bg-border/60" />
                            )}
                            <span
                              className={`relative z-10 mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full border-2 ${
                                t.status === '办结'
                                  ? 'border-emerald-400 bg-emerald-400/30'
                                  : t.status === '初告'
                                    ? 'border-orange-400 bg-orange-400/30'
                                    : 'border-blue-400 bg-blue-400/30'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-digital text-[10px] text-muted-foreground">{t.time}</p>
                              <p className="text-xs font-semibold text-foreground">
                                {t.org}
                                <span className="ml-1 font-normal text-muted-foreground">（{t.person}）</span>
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                {t.resultLabel && t.resultColor && (
                                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${RESULT_CLS[t.resultColor]}`}>
                                    {t.resultLabel}
                                  </span>
                                )}
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_CLS[t.status] ?? 'bg-secondary/40 text-muted-foreground'}`}>
                                  当前状态：{t.status}
                                </span>
                              </div>
                              {t.opinion && (
                                <p className="mt-1 text-[11px] leading-relaxed text-foreground/85">
                                  {t.status === '研判' || t.status === '结案审核' ? '研判意见：' : '调度情况：'}
                                  {t.opinion}
                                </p>
                              )}
                              {t.dispatchedTo && (
                                <div className="mt-1 flex flex-wrap items-center gap-1">
                                  <span className="text-[10px] text-muted-foreground">派遣至：</span>
                                  {t.dispatchedTo.map((d) => (
                                    <span key={d} className="rounded bg-primary/12 px-1.5 py-0.5 text-[10px] text-primary/90">
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {t.dispatchNote && (
                                <p className="mt-1 text-[10px] text-foreground/80">
                                  <span className="text-muted-foreground">下派批示：</span>
                                  {t.dispatchNote}
                                </p>
                              )}
                              {t.readCount != null && (
                                <p className="mt-1 text-[10px] text-muted-foreground/70">{t.readCount}已读</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'process' && (
                      <div className="space-y-2.5">
                        {/* 警情来源标识 + 分类标签 */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {event.process?.alertSource ?? '122警情'}
                          </span>
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/40">
                            {event.process?.alertCategory ?? '事故类'}
                          </span>
                        </div>

                        {/* 信息表格 */}
                        <div className="overflow-hidden rounded border border-border/70">
                          <table className="w-full border-collapse text-xs text-foreground">
                            <tbody>
                              <tr className="border-b border-border/50">
                                <td className="w-[88px] bg-secondary/40 px-2 py-1.5 text-muted-foreground">来源类型</td>
                                <td className="px-2 py-1.5">{event.process?.sourceType ?? '—'}</td>
                                <td className="w-[88px] bg-secondary/40 px-2 py-1.5 text-muted-foreground">事件编号</td>
                                <td className="px-2 py-1.5 break-all font-digital">{event.process?.eventNo ?? '—'}</td>
                              </tr>
                              <tr className="border-b border-border/50">
                                <td className="bg-secondary/40 px-2 py-1.5 text-muted-foreground">警情等级</td>
                                <td className="px-2 py-1.5">{event.process?.alertLevel ?? '—'}</td>
                                <td className="bg-secondary/40 px-2 py-1.5 text-muted-foreground">事件分类</td>
                                <td className="px-2 py-1.5">{event.process?.eventCategory ?? '—'}</td>
                              </tr>
                              <tr className="border-b border-border/50">
                                <td className="bg-secondary/40 px-2 py-1.5 text-muted-foreground">发现时间</td>
                                <td className="px-2 py-1.5 font-digital">{event.process?.discoverTime ?? '—'}</td>
                                <td className="bg-secondary/40 px-2 py-1.5 text-muted-foreground">上报时间</td>
                                <td className="px-2 py-1.5 font-digital">{event.process?.reportTime ?? '—'}</td>
                              </tr>
                              <tr className="border-b border-border/50">
                                <td className="bg-secondary/40 px-2 py-1.5 text-muted-foreground">事件地址</td>
                                <td className="px-2 py-1.5 break-all" colSpan={3}>
                                  {event.process?.address ?? '—'}
                                </td>
                              </tr>
                              <tr>
                                <td className="bg-secondary/40 px-2 py-1.5 text-muted-foreground">事件描述</td>
                                <td className="px-2 py-1.5 break-all leading-relaxed" colSpan={3}>
                                  {event.process?.description ?? '—'}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeTab === 'apply' && (
                      <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-border/60 py-10 text-muted-foreground/60">
                        <Inbox className="h-6 w-6" />
                        <p className="text-xs">暂无数据</p>
                      </div>
                    )}

                    {activeTab === 'instruct' && (
                      <div className="space-y-2.5">
                        {/* 批示人 + 填报时间刷选 */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="shrink-0 text-[11px] text-muted-foreground">批示人:</span>
                            <input
                              type="text"
                              placeholder="请输入批示人"
                              className="h-7 w-28 rounded border border-border/70 bg-background/60 px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/60"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="shrink-0 text-[11px] text-muted-foreground">填报时间:</span>
                            <div className="flex items-center gap-1 rounded border border-border/70 bg-background/60 px-2">
                              <Calendar className="h-3 w-3 text-muted-foreground/60" />
                              <input
                                type="text"
                                placeholder="开始日期"
                                className="h-7 w-20 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
                              />
                              <span className="text-muted-foreground/60">→</span>
                              <input
                                type="text"
                                placeholder="结束日期"
                                className="h-7 w-20 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              className="flex items-center gap-1 rounded bg-primary/80 px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary"
                            >
                              <Search className="h-3 w-3" /> 查询
                            </button>
                            <button
                              type="button"
                              className="rounded border border-border/70 bg-background/60 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-secondary"
                            >
                              重置
                            </button>
                          </div>
                        </div>

                        {/* 批示列表 */}
                        <div className="overflow-hidden rounded border border-border/70">
                          <table className="w-full border-collapse text-xs text-foreground">
                            <thead>
                              <tr className="bg-secondary/40 text-muted-foreground">
                                <th className="border-b border-border/50 px-2 py-1.5 text-left font-medium">批示人</th>
                                <th className="border-b border-border/50 px-2 py-1.5 text-left font-medium">批示内容</th>
                                <th className="border-b border-border/50 px-2 py-1.5 text-left font-medium">填报时间</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td colSpan={3} className="px-2 py-8 text-center text-muted-foreground/60">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-xs">暂无数据</span>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
