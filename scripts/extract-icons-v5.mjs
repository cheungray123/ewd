import sharp from 'sharp';
import { mkdirSync } from 'fs';

const IMG_PATH = 'd:/theme/static/acc6d11e-e072-4abf-af9a-70a64964f9c4.png';
const OUT_DIR = 'd:/theme/static/icons';

mkdirSync(OUT_DIR, { recursive: true });

// 基于原图 1254x1254 的像素级分析：
//
// 从截图看，favicon 区域在图片下半部分
// "FAVICON" 文字标签在 y≈580 位置
// 5 个圆形图标在 y≈700-850 区域
//
// 从左到右观察：
// - 最左侧小圆：x≈100-180, y≈720-800
// - 第二个圆：x≈250-350, y≈700-800
// - 第三个圆：x≈420-550, y≈680-810
// - 第四个圆：x≈600-760, y≈660-820
// - 最右侧大圆：x≈820-1020, y≈640-840

const icons = [
	// APP ICON
	{ name: 'app-icon-light', left: 80, top: 80, width: 500, height: 500 },
	{ name: 'app-icon-light-small', left: 750, top: 80, width: 200, height: 200 },
	{ name: 'app-icon-dark-small', left: 750, top: 320, width: 200, height: 200 },

	// FAVICON - 保守估计的边界框
	{ name: 'favicon-16', left: 100, top: 720, width: 80, height: 80 },
	{ name: 'favicon-32', left: 250, top: 700, width: 100, height: 100 },
	{ name: 'favicon-64', left: 420, top: 680, width: 130, height: 130 },
	{ name: 'favicon-128', left: 600, top: 660, width: 160, height: 160 },
	{ name: 'favicon-256', left: 820, top: 640, width: 200, height: 200 }
];

console.log('Extracting icons (v5)...\n');

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
