import sharp from 'sharp';
import { readFileSync } from 'fs';

const IMG_PATH = 'd:/theme/static/acc6d11e-e072-4abf-af9a-70a64964f9c4.png';
const OUT_DIR = 'd:/theme/static/icons';

const img = sharp(IMG_PATH);
const meta = await img.metadata();
console.log('Image metadata:', JSON.stringify(meta, null, 2));

const { width, height } = meta;
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const channels = info.channels;

// 扫描每一行，找到非透明像素的列范围
// 记录每行是否有非透明像素
const rowHasContent = new Array(height).fill(false);
const colHasContent = new Array(width).fill(false);

for (let y = 0; y < height; y++) {
	for (let x = 0; x < width; x++) {
		const idx = (y * width + x) * channels;
		const alpha = data[idx + 3];
		if (alpha > 10) {
			rowHasContent[y] = true;
			colHasContent[x] = true;
		}
	}
}

// 找到所有行的连续段（每个段是一个图标行的 Y 范围）
const rowSegments = [];
let inSeg = false;
let segStart = 0;
for (let y = 0; y < height; y++) {
	if (rowHasContent[y] && !inSeg) {
		inSeg = true;
		segStart = y;
	} else if (!rowHasContent[y] && inSeg) {
		inSeg = false;
		rowSegments.push({ start: segStart, end: y - 1 });
	}
}
if (inSeg) rowSegments.push({ start: segStart, end: height - 1 });

// 找到所有列的连续段
const colSegments = [];
inSeg = false;
segStart = 0;
for (let x = 0; x < width; x++) {
	if (colHasContent[x] && !inSeg) {
		inSeg = true;
		segStart = x;
	} else if (!colHasContent[x] && inSeg) {
		inSeg = false;
		colSegments.push({ start: segStart, end: x - 1 });
	}
}
if (inSeg) colSegments.push({ start: segStart, end: width - 1 });

console.log(`\nRow segments (${rowSegments.length}):`);
rowSegments.forEach((s, i) =>
	console.log(`  [${i}] y: ${s.start}-${s.end} (h=${s.end - s.start + 1})`)
);

console.log(`\nCol segments (${colSegments.length}):`);
colSegments.forEach((s, i) =>
	console.log(`  [${i}] x: ${s.start}-${s.end} (w=${s.end - s.start + 1})`)
);

// 现在需要更精细地分析：每个行段内，找出独立的图标
// 方法：对每个行段，扫描该行段内的每一列，找到非透明像素的列范围
// 然后在列方向上找到连续段
const icons = [];

for (const rowSeg of rowSegments) {
	// 对这个行段，扫描每一列
	const segColHasContent = new Array(width).fill(false);
	for (let x = 0; x < width; x++) {
		for (let y = rowSeg.start; y <= rowSeg.end; y++) {
			const idx = (y * width + x) * channels;
			const alpha = data[idx + 3];
			if (alpha > 10) {
				segColHasContent[x] = true;
				break;
			}
		}
	}

	// 找到这个行段内的列连续段
	const segColSegments = [];
	inSeg = false;
	segStart = 0;
	for (let x = 0; x < width; x++) {
		if (segColHasContent[x] && !inSeg) {
			inSeg = true;
			segStart = x;
		} else if (!segColHasContent[x] && inSeg) {
			inSeg = false;
			segColSegments.push({ start: segStart, end: x - 1 });
		}
	}
	if (inSeg) segColSegments.push({ start: segStart, end: width - 1 });

	for (const colSeg of segColSegments) {
		// 对这个列段，重新扫描行，找到精确的行范围
		let minY = rowSeg.end,
			maxY = rowSeg.start;
		for (let y = rowSeg.start; y <= rowSeg.end; y++) {
			for (let x = colSeg.start; x <= colSeg.end; x++) {
				const idx = (y * width + x) * channels;
				const alpha = data[idx + 3];
				if (alpha > 10) {
					if (y < minY) minY = y;
					if (y > maxY) maxY = y;
					break;
				}
			}
		}

		const w = colSeg.end - colSeg.start + 1;
		const h = maxY - minY + 1;
		icons.push({
			left: colSeg.start,
			top: minY,
			width: w,
			height: h,
			size: w > h ? `${w}x${h}` : `${w}x${h}`
		});
	}
}

console.log(`\n=== Detected ${icons.length} icons ===`);
icons.forEach((icon, i) => {
	console.log(`  Icon ${i}: ${icon.size} at (${icon.left}, ${icon.top})`);
});

// 提取每个图标
import { mkdirSync } from 'fs';
mkdirSync(OUT_DIR, { recursive: true });

for (let i = 0; i < icons.length; i++) {
	const icon = icons[i];
	const outPath = `${OUT_DIR}/icon-${i + 1}-${icon.width}x${icon.height}.png`;
	await sharp(IMG_PATH)
		.extract({
			left: icon.left,
			top: icon.top,
			width: icon.width,
			height: icon.height
		})
		.png()
		.toFile(outPath);
	console.log(`  ✓ Saved: ${outPath}`);
}

console.log(`\nDone! ${icons.length} icons extracted to ${OUT_DIR}`);
