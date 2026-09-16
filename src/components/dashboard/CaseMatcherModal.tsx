// 相似案例匹配引擎 · 全屏半透明遮罩模态弹窗（红金政务风，900px 宽 / 80vh 高）
import { Search, X } from 'lucide-react';
import CaseMatcher from './CaseMatcher';

interface CaseMatcherModalProps {
  open: boolean;
  onClose: () => void;
  externalQuery?: { text: string; seq: number } | null;
}

export default function CaseMatcherModal({ open, onClose, externalQuery }: CaseMatcherModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="screen-panel corner-decor animate-modal-in flex h-[80vh] max-h-[80vh] w-[900px] max-w-[90vw] flex-col overflow-hidden rounded-lg border border-primary/40 shadow-[0_0_48px_rgba(212,168,67,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗标题栏（标题 20px 加粗，内边距 20px，右上角 24px 关闭钮） */}
        <div className="flex shrink-0 items-center gap-2.5 px-5 pt-4 pb-2.5">
          <Search className="h-5 w-5 shrink-0 text-primary" />
          <h3 className="text-xl font-bold tracking-wide text-foreground">相似案例匹配引擎</h3>
          <span className="text-sm text-muted-foreground">新事件处置参考</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded border border-border/70 bg-secondary/40 text-muted-foreground transition-colors hover:border-risk-high/50 hover:text-risk-high"
            aria-label="关闭"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="title-bar mx-5 h-px shrink-0 opacity-70" />

        {/* 弹窗内容（内边距 20px，内部列表可滚动） */}
        <div className="min-h-0 flex-1 overflow-hidden p-5">
          <CaseMatcher className="h-full" externalQuery={externalQuery} bare />
        </div>
      </div>
    </div>
  );
}
