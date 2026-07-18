# 像素宇宙（Pixel Universe）设计令牌文档

> 复古像素 + 超现实 · CRT 美学设计系统
> 适用于「虚空回响」/「東風」博客全站

---

## 1. 色彩系统（Palette）

### 暗色模式（Dark）— 默认

| 令牌             | 值                       | 用途                     |
| ---------------- | ------------------------ | ------------------------ |
| `--bg`           | `#0a0a1a`                | 页面底色，深紫黑         |
| `--surface`      | `#12122a`                | 卡片 / 面板背景（原型）  |
| `--surface`      | `#111128`                | 卡片 / 面板背景（生产）  |
| `--surface-h`    | `#161640`                | 面板悬停态（生产）       |
| `--surface-alt`  | `#1a1a3a`                | 备用表面色（原型）       |
| `--fg`           | `#e0e0e0`                | 主文本色（原型）         |
| `--fg`           | `#e8e8f0`                | 主文本色（生产）         |
| `--dim`          | `#9090b0`                | 次级文本（生产）         |
| `--muted`        | `#6a6a8a`                | 弱化文本（原型）         |
| `--muted`        | `#6060a0`                | 弱化文本（生产）         |
| `--faint`        | `#404070`                | 极弱文本（生产）         |
| `--border`       | `rgba(255,255,255,0.08)` | 边框（原型）             |
| `--border`       | `#252550`                | 边框（生产）             |
| `--border-l`     | `#1c1c3a`                | 轻量边框（生产）         |
| `--accent`       | `#00ff88`                | 主强调色 — 荧光绿        |
| `--accent-2`     | `#ff6ec7`                | 辅强调色 — 像素粉        |
| `--accent-3`     | `#4488ff`                | 第三强调色 — CRT 蓝      |
| `--accent-soft`  | `rgba(0,255,136,0.08)`   | 强调色半透明填充（生产） |
| `--accent-hover` | `#00cc6a`                | 强调色悬停态（生产）     |
| `--crt-blue`     | `#4488ff`                | CRT 蓝（原型）           |
| `--link`         | `#00ff88`                | 链接色（生产）           |
| `--ok`           | `#00ff88`                | 状态-成功（生产）        |
| `--warn`         | `#ffaa00`                | 状态-警告（生产）        |
| `--code-bg`      | `#08081a`                | 代码块背景（生产）       |
| `--code-fg`      | `#c0c0e0`                | 代码块文本（生产）       |
| `--pixel-grid`   | `rgba(255,255,255,0.03)` | 像素网格纹理（原型）     |

### 浅色模式（Light）

通过 `[data-theme="light"]` 属性切换，所有令牌覆盖：

| 令牌             | 值                                           | 用途               |
| ---------------- | -------------------------------------------- | ------------------ |
| `--bg`           | `#f5f3ee`                                    | 暖白底色           |
| `--surface`      | `#ffffff`                                    | 卡片 / 面板背景    |
| `--surface-h`    | `#f0eee8`                                    | 面板悬停态         |
| `--surface-alt`  | `#eee9e0`                                    | 备用表面色（原型） |
| `--fg`           | `#1a1a1a`（原型）/ `#1a1a2e`（生产）         | 主文本色           |
| `--dim`          | `#4a4a6a`                                    | 次级文本           |
| `--muted`        | `#6a6a6a`（原型）/ `#7070a0`（生产）         | 弱化文本           |
| `--faint`        | `#a0a0c0`                                    | 极弱文本           |
| `--border`       | `rgba(0,0,0,0.1)`（原型）/ `#d0d0e0`（生产） | 边框               |
| `--border-l`     | `#e0e0ea`                                    | 轻量边框           |
| `--accent`       | `#0a7a4a`                                    | 主强调色 — 深绿    |
| `--accent-2`     | `#c44a8a`（原型）/ `#c04080`（生产）         | 辅强调色           |
| `--accent-3`     | `#2060c0`                                    | 第三强调色         |
| `--accent-soft`  | `rgba(10,122,74,0.08)`                       | 强调色半透明填充   |
| `--accent-hover` | `#086a3e`                                    | 强调色悬停态       |
| `--crt-blue`     | `#2266cc`                                    | CRT 蓝             |
| `--link`         | `#0a7a4a`                                    | 链接色             |
| `--ok`           | `#0a7a4a`                                    | 状态-成功          |
| `--warn`         | `#c08020`                                    | 状态-警告          |
| `--code-bg`      | `#1a1a2e`                                    | 代码块背景         |
| `--code-fg`      | `#d0d0e0`                                    | 代码块文本         |
| `--glow`         | `none`                                       | 霓虹光效关闭       |
| `--pixel-grid`   | `rgba(0,0,0,0.03)`                           | 像素网格纹理       |

---

## 2. 字体系统（Typography）

### 字体族

| 令牌           | 值                                                                                 | 用途                                |
| -------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| `--font-pixel` | `'Press Start 2P', monospace`                                                      | 品牌名、导航、标题、标签、CTA、数字 |
| `--font-body`  | `'Noto Sans SC', 'Space Grotesk', sans-serif`（原型）                              | 中文正文                            |
| `--font-body`  | `'IBM Plex Mono', 'Noto Sans SC', monospace`（生产）                               | 正文（全等宽）                      |
| `--font-en`    | `'Space Grotesk', sans-serif`                                                      | 英文标题 / 强调（原型）             |
| `--font-mono`  | `'Space Mono', monospace`（原型）/ `'IBM Plex Mono', 'SF Mono', monospace`（生产） | 代码、时间戳、元数据                |

### 字号层级

| 元素          | 字号                                                             | 字体       | 说明                          |
| ------------- | ---------------------------------------------------------------- | ---------- | ----------------------------- |
| 品牌名（Nav） | `10px`（生产）/ `0.7rem`（原型）                                 | Pixel      | 固定                          |
| 导航链接      | `9px`（生产）/ `0.5rem`（原型）                                  | Pixel      | 大写                          |
| 标题 eyebrow  | `8px`（生产）/ `clamp(0.45rem,0.8vw,0.6rem)`（原型）             | Pixel      | 大写 + 0.12em 字距            |
| Hero 标题     | `clamp(14px,3vw,22px)`（生产）/ `clamp(2rem,6vw,4.5rem)`（原型） | Pixel      | 生产端紧凑，原型端大标题      |
| 区块标题      | `11px`                                                           | Pixel      | `letter-spacing: 0.04em`      |
| 英文副标题    | `7px`                                                            | Pixel      | 大写 + `0.14em` 字距          |
| 正文          | `13-14px`                                                        | Body       | `line-height: 1.7-1.8`        |
| 摘要          | `12px`                                                           | Body       | 3 行截断                      |
| 代码 / 元数据 | `10px`                                                           | Mono       | `letter-spacing: 0.04-0.06em` |
| 标签 / tag    | `7-8px`                                                          | Pixel      | 大写                          |
| 统计数字      | `14px`（生产）/ `0.9rem`（原型）                                 | Pixel      | 荧光绿                        |
| 统计标签      | `7px`（生产）/ `0.5rem`（原型）                                  | Mono/Pixel | 大写                          |

---

## 3. 间距系统（Spacing）

| 令牌       | 值                 |
| ---------- | ------------------ |
| `--sp-xs`  | `0.375rem`（≈6px） |
| `--sp-sm`  | `0.75rem`（≈12px） |
| `--sp-md`  | `1.25rem`（≈20px） |
| `--sp-lg`  | `2rem`（≈32px）    |
| `--sp-xl`  | `3.2rem`（≈51px）  |
| `--sp-2xl` | `5rem`（≈80px）    |

---

## 4. 圆角（Radius）

像素宇宙 = **零圆角**，所有卡片、按钮、输入框均为直角。

| 令牌     | 值  |
| -------- | --- |
| `--r-sm` | `0` |
| `--r-md` | `0` |
| `--r-lg` | `0` |

---

## 5. 阴影系统（Shadows）

像素阴影 = 硬偏移，无模糊。悬停时偏移增大 = "弹起"效果。

| 令牌                   | 值                                                       | 用途                 |
| ---------------------- | -------------------------------------------------------- | -------------------- |
| `--shadow-sm`          | `2px 2px 0 rgba(0,0,0,0.4)`                              | 小卡片               |
| `--shadow-md`          | `4px 4px 0 rgba(0,0,0,0.5)`                              | 中面板 / 卡片        |
| `--shadow-lg`          | `6px 6px 0 rgba(0,0,0,0.5)`                              | 大面板               |
| `--pixel-shadow`       | `4px 4px 0`（原型）/ `4px 4px 0 rgba(0,0,0,0.5)`（生产） | 通用像素阴影         |
| `--pixel-shadow-lg`    | `6px 6px 0`                                              | 大尺寸像素阴影       |
| `--pixel-shadow-hover` | `8px 8px 0`                                              | 悬停态弹起           |
| `--glow`               | `0 0 12px rgba(0,255,136,0.2)`                           | 霓虹光效（暗色模式） |

**悬停规则**：`translate(-2px, -2px)` + 阴影从 4px 扩大到 8px + 边框变 accent 色。

---

## 6. 布局系统（Layout）

### 容器

| 令牌     | 值               |
| -------- | ---------------- |
| `--wrap` | `1100px`（生产） |

原型容器：`max-width: 1200px; margin: 0 auto; padding: 0 clamp(20px,4vw,48px)`

### 网格

| 组件       | 网格                                                          | 断点                            |
| ---------- | ------------------------------------------------------------- | ------------------------------- |
| Bento 卡片 | `grid-template-columns: repeat(4,1fr)`                        | 920px → 2 列；600px → 1 列      |
| 文章布局   | `grid-template-columns: 30% 1fr`（原型）/ `1.3fr 1fr`（生产） | 900px → 单列                    |
| 相册网格   | `grid-template-columns: repeat(3,1fr)`                        | 920px → 3 列不变；680px → 2 列  |
| 瀑布流行   | `grid-template-columns: 1fr 1.3fr 1fr`（生产）                | 900px → `1fr 1fr`；680px → 单列 |
| Footer     | `grid-template-columns: 2fr 1fr 1fr 1fr`                      | 920px → `1fr 1fr`；600px → 单列 |

### 响应式断点

| 断点                             | 行为                                           |
| -------------------------------- | ---------------------------------------------- |
| `920px`（原型）/ `900px`（生产） | 隐藏桌面导航 → 汉堡菜单；Hero 单栏；Bento 2 列 |
| `680px`（生产）                  | 导航下拉菜单；照片单列；笔记单列               |
| `600px`（原型）                  | Bento 1 列；Footer 单列                        |
| `440px`（生产）                  | 统计数字换行；画廊单列                         |

---

## 7. 边框系统（Borders）

| 类型             | 样式                                                                                                          | 用途                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `--pixel-border` | `2px solid var(--border)`                                                                                     | 通用边框               |
| 像素卡片         | `2px solid var(--border)` + `var(--pixel-shadow)`                                                             | 所有卡片               |
| 悬停态           | `2px solid var(--accent)` + `var(--pixel-shadow-hover)`                                                       | 交互反馈               |
| 虚线分隔         | `1px dashed rgba(255,255,255,0.06)`                                                                           | 文章列表、Moments 分隔 |
| 实线分隔         | `2px solid rgba(255,255,255,0.04)`                                                                            | Footer 顶部分隔        |
| 绿色虚线         | `repeating-linear-gradient(90deg, var(--accent) 0, var(--accent) 8px, transparent 8px, transparent 16px)`     | 文章板块顶部装饰       |
| 粉色虚线         | `repeating-linear-gradient(90deg, var(--accent-2) 0, var(--accent-2) 8px, transparent 8px, transparent 16px)` | Moments 板块顶部装饰   |
| 像素分割线       | 等宽 8px × 8px 色块行                                                                                         | Footer 顶部            |

---

## 8. 动画系统（Motion）

### 缓动函数

| 令牌     | 值              | 用途                    |
| -------- | --------------- | ----------------------- |
| `--ease` | `steps(4, end)` | 所有过渡 — 像素级阶梯感 |

### 关键帧动画

| 动画名               | 效果                                        | 用途                  |
| -------------------- | ------------------------------------------- | --------------------- |
| `crt-flicker`        | 微弱闪烁（opacity 0.97→1）                  | `body` 全局 CRT 效果  |
| `pixel-breathe`      | opacity 0.8→1→0.8                           | 光标闪烁、脉冲点      |
| `pixel-glow`         | text-shadow 荧光绿呼吸                      | 品牌名发光            |
| `scanline-move`      | top -100%→200%                              | Hero / Quote 区扫描线 |
| `pulse-dot`          | scale 1→1.4 + box-shadow 扩散               | 状态点、时间线节点    |
| `pixel-bounce`       | translateY 0→-4px→0                         | 像素装饰块浮动        |
| `hero-title-breathe` | opacity 0.9→1→0.9                           | Hero 标题呼吸         |
| `pixel-pulse`        | opacity 1→0.3→1（steps(2)）                 | 状态指示灯            |
| `ticker-scroll`      | translateX 0→-50%                           | 状态栏滚动文字        |
| `reveal`             | opacity 0→1 + translateY 12px→0（steps(6)） | 滚动出现动画          |

### 交互过渡

| 场景       | 过渡                                                          | 时长            |
| ---------- | ------------------------------------------------------------- | --------------- |
| 卡片悬停   | `transform: translate(-2px,-2px)` + border-color + box-shadow | `0.2-0.3s`      |
| 链接悬停   | `color` + `text-shadow`                                       | `0.2-0.3s`      |
| 导航下划线 | `width: 0→100%`                                               | `0.3s`          |
| 照片遮罩   | `opacity: 0→1` + `transform: translateY(6px)→0`               | `0.3s`          |
| 照片缩放   | `transform: scale(1.06)`                                      | `0.6s`          |
| 滚动出现   | `opacity + transform`                                         | `0.5s steps(6)` |

---

## 9. CRT 效果层

### 扫描线（Scanline Overlay）

```css
/* 全局 — body::after 或 .crt-overlay */
position: fixed;
inset: 0;
background: repeating-linear-gradient(
	0deg,
	transparent,
	transparent 2px,
	rgba(0, 0, 0, 0.03) 2px,
	rgba(0, 0, 0, 0.03) 4px
);
pointer-events: none;
z-index: 9999;

/* 浅色模式降低强度 */
[data-theme='light'] & {
	background: repeating-linear-gradient(
		0deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.015) 2px,
		rgba(0, 0, 0, 0.015) 4px
	);
}
```

### 浮动扫描线

```css
.hero-scanline,
.quote-scanline {
	position: absolute;
	left: 0;
	right: 0;
	height: 2-3px;
	background: linear-gradient(90deg, transparent, var(--accent), transparent);
	opacity: 0.1-0.12;
	animation: scanline-move 5-6s linear infinite;
}
```

---

## 10. 按钮系统（Buttons）

### 主按钮 `.btn-primary` / `.hero-cta`

```css
padding: 0.5rem 0.9rem;
background: var(--accent);
color: #0a0a1a;
font-family: var(--font-pixel);
font-size: 8px;
letter-spacing: 0.04em;
border: 2px solid var(--accent);

/* 悬停 */
background: var(--accent-hover);
transform: translate(-1px, -1px);
box-shadow: 2px 2px 0 rgba(0, 255, 136, 0.3);
```

### 次按钮 `.hero-cta-secondary`

```css
border: 2px solid var(--border);
background: transparent;
color: var(--muted);
box-shadow: 3px 3px 0 var(--border);

/* 悬停 */
border-color: var(--accent-2);
color: var(--accent-2);
box-shadow: 3px 3px 0 var(--accent-2);
```

### 工具按钮 `.tool-btn`

```css
width: 34px;
height: 34px;
color: var(--dim);
border: 1px solid transparent;

/* 悬停 */
color: var(--accent);
border-color: var(--border);
background: var(--accent-soft);
```

---

## 11. 组件令牌速查

### 导航栏 `.site-header` / `.nav`

- 背景：`color-mix(in oklch, var(--bg) 92%, transparent)` + `backdrop-filter: blur(8px)`
- 高度：`52px`（生产）/ `16px padding`（原型）
- 品牌：Pixel 字体 + accent 色 + `text-shadow: 2px 2px 0 rgba(0,255,136,0.15)`
- 链接：Pixel 9px + dim 色 → hover 变 accent

### Hero

- 高度：`min-height: 340px`（生产）/ `65vh`（原型）
- 网格：`1.2fr 1fr`（生产）/ `1fr 1fr`（原型）
- 标题：Pixel + `clamp()` 自适应 + accent 文字阴影
- 统计数字：Pixel + accent 色 + `tabular-nums`

### 卡片（通用）

- 背景：`var(--surface)`
- 边框：`2px solid var(--border)`
- 阴影：`var(--shadow-sm/md)`
- 悬停：`translate(-2px,-2px)` + 边框变 accent + 阴影扩大

### 卷轴条 `::selection`

```css
::selection {
	background: var(--accent);
	color: #0a0a1a;
}
[data-theme='light'] ::selection {
	color: #fff;
}
```

### 滚动条

```css
::-webkit-scrollbar {
	width: 8px;
}
::-webkit-scrollbar-track {
	background: var(--bg);
}
::-webkit-scrollbar-thumb {
	background: var(--border);
	border: 2px solid var(--bg);
}
::-webkit-scrollbar-thumb:hover {
	background: var(--accent);
}
```

---

## 12. 焦点与无障碍

```css
:focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 3px;
}

/* 减弱动画 */
@media (prefers-reduced-motion: reduce) {
	* {
		animation: none !important;
		transition-duration: 0.01ms !important;
	}
	.reveal {
		opacity: 1 !important;
		transform: none !important;
	}
}
```

---

## 13. CSS 变量完整声明（可直接复制使用）

```css
:root {
	/* 暗色模式 — 像素宇宙 */
	--bg: #0a0a1a;
	--surface: #111128;
	--surface-h: #161640;
	--surface-alt: #1a1a3a;
	--fg: #e8e8f0;
	--dim: #9090b0;
	--muted: #6060a0;
	--faint: #404070;
	--border: #252550;
	--border-l: #1c1c3a;
	--accent: #00ff88;
	--accent-2: #ff6ec7;
	--accent-3: #4488ff;
	--accent-soft: rgba(0, 255, 136, 0.08);
	--accent-hover: #00cc6a;
	--link: #00ff88;
	--ok: #00ff88;
	--warn: #ffaa00;
	--code-bg: #08081a;
	--code-fg: #c0c0e0;
	--glow: 0 0 12px rgba(0, 255, 136, 0.2);
	--pixel-grid: rgba(255, 255, 255, 0.03);
	--pixel-border: 2px solid var(--border);
	--pixel-shadow: 4px 4px 0 rgba(0, 0, 0, 0.5);
	--pixel-shadow-lg: 6px 6px 0 rgba(0, 0, 0, 0.5);
	--pixel-shadow-hover: 8px 8px 0 rgba(0, 0, 0, 0.5);
	--shadow-sm: 2px 2px 0 rgba(0, 0, 0, 0.4);
	--shadow-md: 4px 4px 0 rgba(0, 0, 0, 0.5);
	--shadow-lg: 6px 6px 0 rgba(0, 0, 0, 0.5);

	/* 字体 */
	--font-pixel: 'Press Start 2P', monospace;
	--font-body: 'IBM Plex Mono', 'Noto Sans SC', monospace;
	--font-en: 'Space Grotesk', sans-serif;
	--font-mono: 'IBM Plex Mono', 'SF Mono', monospace;

	/* 间距 */
	--sp-xs: 0.375rem;
	--sp-sm: 0.75rem;
	--sp-md: 1.25rem;
	--sp-lg: 2rem;
	--sp-xl: 3.2rem;
	--sp-2xl: 5rem;

	/* 圆角 = 0 */
	--r-sm: 0;
	--r-md: 0;
	--r-lg: 0;

	/* 动效 */
	--ease: steps(4, end);

	/* 布局 */
	--wrap: 1100px;
}

[data-theme='light'] {
	--bg: #f5f3ee;
	--surface: #ffffff;
	--surface-h: #f0eee8;
	--fg: #1a1a2e;
	--dim: #4a4a6a;
	--muted: #7070a0;
	--faint: #a0a0c0;
	--border: #d0d0e0;
	--border-l: #e0e0ea;
	--accent: #0a7a4a;
	--accent-2: #c04080;
	--accent-3: #2060c0;
	--accent-soft: rgba(10, 122, 74, 0.08);
	--accent-hover: #086a3e;
	--link: #0a7a4a;
	--ok: #0a7a4a;
	--warn: #c08020;
	--code-bg: #1a1a2e;
	--code-fg: #d0d0e0;
	--glow: none;
	--shadow-sm: 2px 2px 0 rgba(0, 0, 0, 0.08);
	--shadow-md: 4px 4px 0 rgba(0, 0, 0, 0.1);
	--shadow-lg: 6px 6px 0 rgba(0, 0, 0, 0.12);
	--pixel-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
	--pixel-border: 2px solid var(--border);
}
```

---

## 14. Google Fonts 导入

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=IBM+Plex+Mono:wght@400;500;700&family=Noto+Sans+SC:wght@300;400;500;700;900&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
	rel="stylesheet"
/>
```

---

## 15. 品牌关键词

**像素宇宙** — 复古像素 × 超现实主义 × CRT 美学

- 荧光绿 `#00ff88` = 生命力、数字信号、能量脉冲
- 像素粉 `#ff6ec7` = 超现实、梦幻、复古游戏
- CRT 蓝 `#4488ff` = 科技感、屏幕、信息流
- 深紫黑 `#0a0a1a` = 宇宙深空、沉浸感
- 像素字体 + 无模糊阴影 = 8-bit 怀旧
- CRT 扫描线 + 噪点 = 显示器质感
- 阶梯缓动 `steps(4,end)` = 像素级运动
