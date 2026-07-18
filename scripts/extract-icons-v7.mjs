import sharp from 'sharp';
import { mkdirSync } from 'fs';

const IMG_PATH = 'd:/theme/static/acc6d11e-e072-4abf-af9a-70a64964f9c4.png';
const OUT_DIR = 'd:/theme/static/icons';

mkdirSync(OUT_DIR, { recursive: true });

// 关键发现：
// - 深色图标在 x=750-950（因为 left=750, width=200）
// - favicon-256 在 x=700 时切到了深色图标边缘
// - 所以 favicon-256 必须在 x>950 的位置
//
// 重新理解原图布局：
// 从原图看，favicon 圆形图标在图片下半部分，从左到右排列
// 最右侧的大圆应该在深色图标的右侧，即 x>950
//
// 调整后的坐标：
// - favicon-16:   最左侧，x≈100
// - favicon-32:   x≈220
// - favicon-64:   x≈350
// - favicon-128:  x≈500
// - favicon-256:  最右侧，x≈980（在深色图标右侧）

const icons = [
	// APP ICON
	{ name: 'app-icon-light', left: 80, top: 80, width: 500, height: 500 },
	{ name: 'app-icon-light-small', left: 750, top: 80, width: 200, height: 200 },
	{ name: 'app-icon-dark-small', left: 750, top: 320, width: 200, height: 200 },

	// FAVICON - 最右侧的大圆在深色图标右侧
	{ name: 'favicon-16', left: 100, top: 720, width: 80, height: 80 },
	{ name: 'favicon-32', left: 220, top: 710, width: 100, height: 100 },
	{ name: 'favicon-64', left: 350, top: 700, width: 120, height: 120 },
	{ name: 'favicon-128', left: 500, top: 690, width: 150, height: 150 },
	{ name: 'favicon-256', left: 980, top: 680, width: 180, height: 180 }
];

console.log('Extracting icons (v7)...\n');

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
