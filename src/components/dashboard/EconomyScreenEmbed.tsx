// 经济大屏（外部系统）嵌入页：城运中心街道综合平台 · 长丰街道经济大屏
// 上游未设置 X-Frame-Options / CSP frame-ancestors，可直接 iframe 内嵌；
// 外部系统为第三方域，浏览器可能拦截 iframe 内的登录态 Cookie，故另提供「新窗口打开」兜底
import { useState } from 'react';
import { ExternalLink, Monitor, RotateCw } from 'lucide-react';
import PanelShell from './PanelShell';

/** 经济大屏地址（长丰街道经济大屏，未登录时上游会跳转登录页） */
export const ECONOMY_SCREEN_URL = 'https://cy-test.greatsea.net.cn/#/changfeng/economicScreen';

const btnCls =
  'flex items-center gap-1 rounded-[2px] border border-[#AEF4FC]/45 bg-[#AEF4FC]/10 px-2 py-0.5 text-[11px] text-[#AEF4FC] transition-colors hover:bg-[#AEF4FC]/20';

export default function EconomyScreenEmbed({ className }: { className?: string }) {
  /** 重载序号：变更 key 强制 iframe 重新挂载 */
  const [reloadSeq, setReloadSeq] = useState(0);

  return (
    <PanelShell
      title="经济大屏"
      subtitle="城运中心街道综合平台 · 外部系统"
      icon={<Monitor className="h-4 w-4" />}
      className={className}
      bodyClassName="p-2"
      actions={
        <div className="flex items-center gap-2">
          <button type="button" className={btnCls} onClick={() => setReloadSeq((s) => s + 1)}>
            <RotateCw className="h-3 w-3" />
            重新加载
          </button>
          <button
            type="button"
            className={btnCls}
            onClick={() => window.open(ECONOMY_SCREEN_URL, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-3 w-3" />
            新窗口打开
          </button>
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-1.5">
        <iframe
          key={reloadSeq}
          src={ECONOMY_SCREEN_URL}
          title="经济大屏"
          className="min-h-0 w-full flex-1 rounded-[2px] border border-primary/25 bg-white"
          referrerPolicy="no-referrer"
        />
        <p className="flex shrink-0 items-center gap-1.5 rounded-[2px] border-l-2 border-l-[#00E5FF] bg-[rgba(30,136,229,0.12)] px-2 py-1 text-[11px] leading-snug tracking-[0.02em] text-[#AEF4FC]">
          首次进入请在下方窗口登录一次（长丰账号 + 短信验证码，验证码长期有效）。登录后本机将保留登录态，之后点开即进大屏；若登录态失效，点右上角「新窗口打开」重新登录即可。
        </p>
      </div>
    </PanelShell>
  );
}
