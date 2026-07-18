import sharp from 'sharp';
import { mkdirSync } from 'fs';

const IMG_PATH = 'd:/theme/static/acc6d11e-e072-4abf-af9a-70a64964f9c4.png';
const OUT_DIR = 'd:/theme/static/icons';

mkdirSync(OUT_DIR, { recursive: true });

// 根据图片布局，手动定义图标位置
// 图片尺寸 1254x1254
// 布局分析：
// - APP ICON 浅色: 左上区域，大约 (80, 80) 到 (580, 580)，圆角矩形
// - APP ICON 深色: 右侧，大约 (800, 200) 到 (1100, 500)，圆角矩形
// - FAVICON 区域: 下方，圆形图标排列

// 根据视觉分析，图标分布如下：
const icons = [
	// APP ICON - 浅色大图标（圆角矩形）
	{ name: 'app-icon-light', left: 80, top: 80, width: 500, height: 500 },
	// APP ICON - 浅色小图标（右上角）
	{ name: 'app-icon-light-small', left: 750, top: 80, width: 220, height: 220 },
	// APP ICON - 深色小图标（右下角）
	{ name: 'app-icon-dark-small', left: 750, top: 320, width: 220, height: 220 },

	// FAVICON - 16x16
	{ name: 'favicon-16', left: 100, top: 700, width: 100, height: 100 },
	// FAVICON - 32x32
	{ name: 'favicon-32', left: 280, top: 700, width: 120, height: 120 },
	// FAVICON - 64x64
	{ name: 'favicon-64', left: 460, top: 700, width: 140, height: 140 },
	// FAVICON - 128x128
	{ name: 'favicon-128', left: 660, top: 700, width: 160, height: 160 },
	// FAVICON - 256x256
	{ name: 'favicon-256', left: 900, top: 700, width: 200, height: 200 }
];

console.log('Extracting icons...\n');

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
