import sharp from 'sharp';
import { mkdirSync } from 'fs';

const IMG_PATH = 'd:/theme/static/acc6d11e-e072-4abf-af9a-70a64964f9c4.png';
const OUT_DIR = 'd:/theme/static/icons';

mkdirSync(OUT_DIR, { recursive: true });

// 基于原图 1254x1254 的精确布局分析：
//
// APP ICON 区域（上半部分 y: 0-600）：
// - 左侧大图标：浅色圆角矩形，约 500x500，位置 (80, 80)
// - 右侧上方：浅色小图标，约 200x200，位置 (750, 80)
// - 右侧下方：深色小图标，约 200x200，位置 (750, 320)
//
// FAVICON 区域（下半部分 y: 650-950）：
// 5 个圆形图标横向排列，每个都是正圆：
// - 16x16:   最左侧小圆，直径约 80px，中心约 (140, 750)
// - 32x32:   第二个圆，直径约 100px，中心约 (300, 750)
// - 64x64:   第三个圆，直径约 130px，中心约 (480, 750)
// - 128x128: 第四个圆，直径约 160px，中心约 (680, 750)
// - 256x256: 最右侧大圆，直径约 200px，中心约 (920, 750)

const icons = [
	// APP ICON
	{ name: 'app-icon-light', left: 80, top: 80, width: 500, height: 500 },
	{ name: 'app-icon-light-small', left: 750, top: 80, width: 200, height: 200 },
	{ name: 'app-icon-dark-small', left: 750, top: 320, width: 200, height: 200 },

	// FAVICON - 基于中心点和直径计算左上角坐标
	// 中心 (140, 750)，直径 80 -> 左上 (100, 710)
	{ name: 'favicon-16', left: 100, top: 710, width: 80, height: 80 },
	// 中心 (300, 750)，直径 100 -> 左上 (250, 700)
	{ name: 'favicon-32', left: 250, top: 700, width: 100, height: 100 },
	// 中心 (480, 750)，直径 130 -> 左上 (415, 685)
	{ name: 'favicon-64', left: 415, top: 685, width: 130, height: 130 },
	// 中心 (680, 750)，直径 160 -> 左上 (600, 670)
	{ name: 'favicon-128', left: 600, top: 670, width: 160, height: 160 },
	// 中心 (920, 750)，直径 200 -> 左上 (820, 650)
	{ name: 'favicon-256', left: 820, top: 650, width: 200, height: 200 }
];

console.log('Extracting icons (v3)...\n');

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
