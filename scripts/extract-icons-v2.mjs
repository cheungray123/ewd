import sharp from 'sharp';
import { mkdirSync } from 'fs';

const IMG_PATH = 'd:/theme/static/acc6d11e-e072-4abf-af9a-70a64964f9c4.png';
const OUT_DIR = 'd:/theme/static/icons';

mkdirSync(OUT_DIR, { recursive: true });

// 重新分析原图布局：
// 图片 1254x1254
//
// APP ICON 区域（上半部分）：
// - 左侧大图标：浅色圆角矩形，大约 500x500
// - 右侧两个小图标：浅色和深色圆角矩形，各约 220x220
//
// FAVICON 区域（下半部分，约 y=680 开始）：
// - 5 个圆形图标横向排列
// - 16x16, 32x32, 64x64, 128x128, 256x256
// - 每个图标周围有间距，整体呈圆形
//
// 根据视觉检查，favicon 的大致位置：
// - favicon-16: 最左侧圆形，约 100x100 区域
// - favicon-32: 第二个圆形，约 120x120 区域
// - favicon-64: 第三个圆形，约 140x140 区域
// - favicon-128: 第四个圆形，约 160x160 区域
// - favicon-256: 最右侧圆形，约 200x200 区域

// 更精确的坐标（基于视觉分析）
const icons = [
	// APP ICON - 浅色大图标（圆角矩形）
	{ name: 'app-icon-light', left: 80, top: 80, width: 500, height: 500 },
	// APP ICON - 浅色小图标
	{ name: 'app-icon-light-small', left: 750, top: 80, width: 220, height: 220 },
	// APP ICON - 深色小图标
	{ name: 'app-icon-dark-small', left: 750, top: 320, width: 220, height: 220 },

	// FAVICON - 重新调整位置
	// 根据原图，favicon 是圆形，标签显示 16x16, 32x32 等是目标尺寸
	// 实际截图区域需要包含整个圆形图标
	// 从截图看，favicon 区域在 y≈650-900 之间

	// favicon-16: 最左边的小圆
	{ name: 'favicon-16', left: 90, top: 680, width: 110, height: 110 },
	// favicon-32: 第二个圆
	{ name: 'favicon-32', left: 260, top: 670, width: 140, height: 140 },
	// favicon-64: 第三个圆
	{ name: 'favicon-64', left: 440, top: 660, width: 170, height: 170 },
	// favicon-128: 第四个圆
	{ name: 'favicon-128', left: 640, top: 650, width: 200, height: 200 },
	// favicon-256: 最右边的大圆
	{ name: 'favicon-256', left: 880, top: 640, width: 240, height: 240 }
];

console.log('Extracting icons (v2)...\n');

for (const icon of icons) {
	const outPath = `${OUT_DIR}/${icon.name}.png`;
	try {
		await sharp(IMG_PATH)
			.extract({
				left: icon.left,
				top: icon.top,
				width: icon.width,
				height: icon.height
			})
			.png()
			.toFile(outPath);
		console.log(`  ✓ ${icon.name}: ${icon.width}x${icon.height} at (${icon.left}, ${icon.top})`);
	} catch (e) {
		console.log(`  ✗ ${icon.name}: ${e.message}`);
	}
}

console.log(`\nDone! Icons saved to ${OUT_DIR}`);
