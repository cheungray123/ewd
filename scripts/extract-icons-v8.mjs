import sharp from 'sharp';
import { mkdirSync } from 'fs';

const IMG_PATH = 'd:/theme/static/acc6d11e-e072-4abf-af9a-70a64964f9c4.png';
const OUT_DIR = 'd:/theme/static/icons';

mkdirSync(OUT_DIR, { recursive: true });

// 问题：所有 favicon 都切到了错误的位置
// 从截图看，favicon-16 在 y=720 处是空白
// 这说明 favicon 区域在更下方
//
// 原图 1254x1254，favicon 区域应该在图片的下半部分
// 让我把 Y 坐标大幅下调到 y=850 左右

const icons = [
	// APP ICON
	{ name: 'app-icon-light', left: 80, top: 80, width: 500, height: 500 },
	{ name: 'app-icon-light-small', left: 750, top: 80, width: 200, height: 200 },
	{ name: 'app-icon-dark-small', left: 750, top: 320, width: 200, height: 200 },

	// FAVICON - 大幅下调 Y 坐标
	{ name: 'favicon-16', left: 100, top: 850, width: 80, height: 80 },
	{ name: 'favicon-32', left: 220, top: 840, width: 100, height: 100 },
	{ name: 'favicon-64', left: 350, top: 830, width: 120, height: 120 },
	{ name: 'favicon-128', left: 500, top: 820, width: 150, height: 150 },
	{ name: 'favicon-256', left: 700, top: 800, width: 200, height: 200 }
];

console.log('Extracting icons (v8)...\n');

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
