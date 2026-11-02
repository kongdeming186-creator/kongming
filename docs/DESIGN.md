# Theme Name: 霓虹科技

# Vibe & Description:
高饱和霓虹，深色基底，玻璃拟态光晕与彩色渐层叠加，营造现代、活力、前沿的数字科技感。

# Color

- 使用深紫蓝作为整体背景基底，推荐 `#1e1b4b` 或接近的深色，不使用纯白背景、灰色背景和黑色文字。
- 主色采用紫色 `#8b5cf6`，搭配青绿 `#06b6d4`、玫红 `#ec4899`、琥珀 `#f59e0b` 作为点缀。
- 大面积视觉重点使用渐变：`from-violet-500 via-purple-500 to-fuchsia-500`，用于按钮、标题强调、装饰线和关键数字。
- 卡片使用半透明玻璃效果：`bg-white/10`、`border-white/20`，文字使用 `text-white`、`text-white/80`、`text-white/60` 保持层次。

# Font

- 使用「阿里巴巴普惠体3.0」作为标题字体，突出科技感和信息层级。（https://resource-static.bj.bcebos.com/fonts-skill/AlibabaPuHuiTi_SemiBold.ttf）
- 使用「阿里巴巴普惠体3.0」作为正文字体，保持清晰、现代、易读。（https://resource-static.bj.bcebos.com/fonts-skill/AlibabaPuHuiTi_Regular.ttf）

# Animation

- 点击按钮或卡片时使用轻微缩放反馈：`active:scale-95`，并配合彩色阴影增强，形成明确的触摸响应。
- 元素出现时采用“淡入 + 光晕扩散”效果，渐变装饰可缓慢漂浮，营造动态科技氛围。
- 所有交互保持顺滑：`transition-all duration-300`，避免生硬位移和传统硬边阴影。

# Layout

- 页面以深色全屏背景为基础，顶部可放置简洁 Logo 与主要操作入口，内容以纵向滚动呈现。
- Hero 区域突出大标题、副标题和主 CTA，背景叠加模糊渐变光晕球，形成视觉焦点。
- 功能、数据和评价内容使用玻璃卡片纵向排列，卡片间距充足，整体保持清晰的移动端阅读节奏。

# Elements

- 按钮使用紫到玫红的渐变背景，圆角为 `rounded-2xl`，配合彩色光晕阴影：`shadow-violet-500/30`。
- 卡片使用 `rounded-3xl`、半透明背景、细白边框和 `backdrop-blur-xl`，呈现悬浮玻璃质感。
- 关键数字使用渐变文字效果，标题和图标可加入青绿、淡紫或玫红点缀。
- 背景装饰使用模糊彩色光斑、渐变线条和半透明叠层，避免实体白卡、黑色文字和尖锐边角。

# Visual Upgrade v27 · 大屏科技感视觉规范（2026-09 迭代）

## 边框体系（双层科技边框）
- 面板/卡片：外框 1px 深蓝 `#1a3a5c` + 内框 1px 青蓝 `rgba(0,212,255,0.35)`（inset box-shadow 实现），圆角 4px。
- 变体类：`.screen-panel`（PanelShell 面板）、`.tech-card`（自绘卡片）、`.tech-card-alert`（红色预警面板，内框红 `rgba(255,71,87,0.22)`）。
- 外发光：`0 0 20px rgba(0,212,255,0.05)` 微光；红色预警面板 `0 0 20px rgba(255,71,87,0.08)`。

## 背景基调
- 主背景加深：`hsl(217 56% 4%)`（≈ #080f1a），深蓝更邃；卡片底 `hsl(219 52% 7%)`。
- 地图叠加低透明度青蓝科技网格：`.tech-grid-overlay`（32px 网格，`pointer-events-none`）。

## 标题装饰
- 面板标题左侧渐变竖条：`.title-vbar`（青蓝→透明 + 辉光 `0 0 8px rgba(0,212,255,0.55)`）。
- 标题文字 `letter-spacing: 1px`（`tracking-[1px]`）。
- 顶部大屏标题两侧对称几何装饰：`.header-deco-line`（渐变线）+ `.header-deco-diamond`（菱形节点，带辉光）。

## 数字动效（纯 CSS，零 JS 定时器）
- CountUp 组件：`@property` 注册可动画整数（`--cu-a/--cu-b/--cu-d`）+ `counter` 渲染 + 自定义 `@counter-style pad3/pad2` 千分位补零；动画 1.2s cubic-bezier(0.16,1,0.3,1)，错峰延迟 0.12-0.2s。
- KPI 大数字：26px / 700 / `text-shadow: 0 0 8px rgba(0,212,255,0.35)`（`.kpi-num`）；次级数字 `.num-glow`。
- 涨跌箭头：TrendingUp/Down + `.animate-arrow-up/.animate-arrow-down` 浮动微动效（1.6s）。

## CSS 动效清单（全部 1.4-1.8s，克制不炫目）
- `.green-breath`：实时接入中绿色呼吸灯（box-shadow 扩散）。
- `.animate-warn-blink`：趋势预警警示图标闪烁（红色 drop-shadow）。
- `.pulse-red-border`：高风险区域卡片红色脉冲呼吸边框。
- `.animate-slide-in-right`：实时事件新条目右侧滑入（0.6s）。
- `.map-marker-high::after`：高危点位心跳式扩散圆环（scale 0.4→2.4）+ drop-shadow 辉光。

## 图表规范（ECharts）
- 折线：width 3px + `shadowColor rgba(60,193,247,0.55)` shadowBlur 14；悬浮 emphasis scale 1.9 + 青蓝辉光。
- 柱状：横向渐变（深蓝→风险色/青蓝三段），`borderRadius [0,4,4,0]`，条体发光 shadowBlur 8，悬浮 emphasis 辉光 18。
- 模块间发光分隔线：`.module-sep`（青蓝渐变 + 微光）。

## 地图标注
- 社区标签：`WebkitTextStroke 0.4px rgba(6,13,26,0.85)` 描边 + 双层黑色 textShadow，提高卫星底图上的可读性。