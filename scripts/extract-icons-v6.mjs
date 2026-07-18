import sharp from 'sharp';
import { mkdirSync } from 'fs';

const IMG_PATH = 'd:/theme/static/acc6d11e-e072-4abf-af9a-70a64964f9c4.png';
const OUT_DIR = 'd:/theme/static/icons';

mkdirSync(OUT_DIR, { recursive: true });

// 重新分析：
// 深色小图标在 (750, 320)，如果高度是 200，则结束于 y=520
// 但截图显示 y=640 仍然切到深色图标，说明深色图标实际更高
// 或者原图布局和我理解的不同
//
// 让我重新理解原图：
// 从浏览器截图看，图片上半部分有：
// - 左侧大浅色图标
// - 右侧上方小浅色图标
// - 右侧下方小深色图标
//
// 下半部分有 favicon 圆形图标
//
// 问题：favicon-256 切到了深色图标，说明 x=820 在深色图标的右侧区域
// 深色图标在 x=750，宽度 200，所以它在 x=750-950 区域
// favicon-256 在 x=820，正好在深色图标区域内！
//
// 这说明：右侧两个小图标不是上下排列，而是和左侧大图标一起占据了上半部分
// 深色图标在右下角， favicon 在更下方
//
// 重新理解布局：
// - 左侧：大浅色图标 (80, 80) 500x500
// - 右侧上方：小浅色图标 (750, 80) 200x200
// - 右侧中间：小深色图标 (750, 320) 200x200 - 但 y=320+200=520，下方还有空间
//
// 等等，如果深色图标在 (750, 320)，宽度 200，那么它在 x=750-950
// favicon-256 在 x=820，正好落在这个范围内！
//
// 所以 favicon 区域的 X 坐标需要调整：
// - 最右侧的 favicon-256 应该在 x>950 的位置
// - 或者 favicon 整体在左侧，不在右侧
//
// 让我重新看原图：favicon 圆形图标在图片的下半部分，横向排列
// 从截图看，它们应该在图片的左侧到中间区域，而不是右侧

const icons = [
	// APP ICON
	{ name: 'app-icon-light', left: 80, top: 80, width: 500, height: 500 },
	{ name: 'app-icon-light-small', left: 750, top: 80, width: 200, height: 200 },
	{ name: 'app-icon-dark-small', left: 750, top: 320, width: 200, height: 200 },

	// FAVICON - 调整 X 坐标，避开右侧的深色图标区域 (750-950)
	// favicon 应该在图片的左下区域
	{ name: 'favicon-16', left: 100, top: 720, width: 80, height: 80 },
	{ name: 'favicon-32', left: 220, top: 710, width: 100, height: 100 },
	{ name: 'favicon-64', left: 360, top: 700, width: 120, height: 120 },
	{ name: 'favicon-128', left: 520, top: 690, width: 150, height: 150 },
	{ name: 'favicon-256', left: 700, top: 680, width: 180, height: 180 }
];

console.log('Extracting icons (v6)...\n');

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
