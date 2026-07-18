import sharp from 'sharp';
import { mkdirSync } from 'fs';

const IMG_PATH = 'd:/theme/static/acc6d11e-e072-4abf-af9a-70a64964f9c4.png';
const OUT_DIR = 'd:/theme/static/icons';

mkdirSync(OUT_DIR, { recursive: true });

// 重新分析原图 1254x1254：
//
// 上半部分（y: 0-600）：
// - 左侧大图标 (80, 80) 500x500
// - 右侧浅色小图标 (750, 80) 200x200
// - 右侧深色小图标 (750, 320) 200x200
//
// 中间分隔区域（y: 520-650）：空白 + "FAVICON" 文字
//
// 下半部分 favicon 区域（y: 680-900）：
// 5 个圆形图标，中心线约在 y=780
// 从左到右：
// - 16x16:   中心 (140, 780)，直径约 60
// - 32x32:   中心 (300, 780)，直径约 80
// - 64x64:   中心 (470, 780)，直径约 110
// - 128x128: 中心 (670, 780)，直径约 140
// - 256x256: 中心 (900, 780)，直径约 180

const icons = [
	// APP ICON
	{ name: 'app-icon-light', left: 80, top: 80, width: 500, height: 500 },
	{ name: 'app-icon-light-small', left: 750, top: 80, width: 200, height: 200 },
	{ name: 'app-icon-dark-small', left: 750, top: 320, width: 200, height: 200 },

	// FAVICON - 基于中心 (x, 780) 和直径计算
	// 中心 (140, 780)，直径 60 -> 左上 (110, 750)
	{ name: 'favicon-16', left: 110, top: 750, width: 60, height: 60 },
	// 中心 (300, 780)，直径 80 -> 左上 (260, 740)
	{ name: 'favicon-32', left: 260, top: 740, width: 80, height: 80 },
	// 中心 (470, 780)，直径 110 -> 左上 (415, 725)
	{ name: 'favicon-64', left: 415, top: 725, width: 110, height: 110 },
	// 中心 (670, 780)，直径 140 -> 左上 (600, 710)
	{ name: 'favicon-128', left: 600, top: 710, width: 140, height: 140 },
	// 中心 (900, 780)，直径 180 -> 左上 (810, 690)
	{ name: 'favicon-256', left: 810, top: 690, width: 180, height: 180 }
];

console.log('Extracting icons (v4)...\n');

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
