import { existsSync, rmSync, mkdirSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const CONTENT_DIR = join(ROOT_DIR, 'src', 'content');
const STATIC_DIR = join(ROOT_DIR, 'static');
const CONTENT_BASE_URL = process.env.CONTENT_BASE_URL || 'https://static.easte.cc';
const API_URL = process.env.CONTENT_API_URL || 'https://admin.easte.cc/api';
const LOCAL_CONTENT_DIR = join(ROOT_DIR, '..', 'site-content'); // 本地 content 目录

console.log('Fetching content from:', CONTENT_BASE_URL);
console.log('API:', API_URL);

// Clean old content
if (existsSync(CONTENT_DIR)) {
	console.log('Cleaning old content...');
	rmSync(CONTENT_DIR, { recursive: true, force: true });
}

// Ensure parent directory exists
mkdirSync(CONTENT_DIR, { recursive: true });

// 判断使用本地还是远程
const useLocal = existsSync(LOCAL_CONTENT_DIR) && process.env.USE_LOCAL_CONTENT === 'true';

if (useLocal) {
	console.log('Using local content directory:', LOCAL_CONTENT_DIR);
	// 从本地复制
	copyDir(LOCAL_CONTENT_DIR, CONTENT_DIR);
	console.log('Content copied from local successfully!');
} else {
	// 从 R2 静态服务下载内容
	console.log('Fetching content list from API...');

	try {
		// 1. 获取已发布内容列表
		const apiRes = await fetch(API_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ event: 'CONTENT_LIST_PUBLISHED' }),
			signal: AbortSignal.timeout(15000)
		});

		if (!apiRes.ok) {
			throw new Error(`API request failed: HTTP ${apiRes.status}`);
		}

		const apiData = await apiRes.json();
		if (apiData.code !== 0 || !Array.isArray(apiData.data)) {
			throw new Error(`API returned error: code=${apiData.code}, message=${apiData.message || 'unknown'}`);
		}

		const files = apiData.data;
		console.log(`Found ${files.length} content files to download.`);

		if (files.length === 0) {
			console.warn('Warning: No content files found. The content directory will be empty.');
		}

		// 2. 下载每个文件
		let successCount = 0;
		let failedCount = 0;

		for (const file of files) {
			const key = file.key; // e.g. "content/posts/hello.md"
			if (!key || !key.endsWith('.md')) continue;

			// 构建下载 URL: https://static.easte.cc/content/posts/hello.md
			const downloadUrl = `${CONTENT_BASE_URL}/${key}`;

			// 构建本地保存路径: src/content/posts/hello.md (去掉 "content/" 前缀)
			const relativePath = key.startsWith('content/') ? key.slice('content/'.length) : key;
			const localPath = join(CONTENT_DIR, relativePath);

			try {
				const res = await fetch(downloadUrl, {
					signal: AbortSignal.timeout(30000)
				});

				if (!res.ok) {
					console.warn(`  Failed: ${relativePath} (HTTP ${res.status})`);
					failedCount++;
					continue;
				}

				const text = await res.text();
				// 确保目录存在
				mkdirSync(dirname(localPath), { recursive: true });
				writeFileSync(localPath, text, 'utf-8');
				successCount++;
			} catch (e) {
				console.warn(`  Failed: ${relativePath} (${e.message})`);
				failedCount++;
			}
		}

		console.log(`\nDownload complete: ${successCount} succeeded, ${failedCount} failed.`);

		if (failedCount > 0) {
			console.warn('Some files failed to download. Check the logs above.');
		}
	} catch (e) {
		console.error('Failed to fetch content from remote:', e.message);
		console.error('');
		console.error('Make sure the API is accessible at:', API_URL);
		console.error('And the content is served at:', CONTENT_BASE_URL);
		console.error('');
		console.error('Or set USE_LOCAL_CONTENT=true to use local site-content directory');
		process.exit(1);
	}
}

// Copy article images to static directory for Vite to process
// (仅本地内容模式下需要，远程模式下图片直接从 R2 加载)
if (useLocal) {
	const articleImagesSrc = join(CONTENT_DIR, 'posts', 'images');
	const articleImagesDest = join(STATIC_DIR, 'posts', 'images');

	if (existsSync(articleImagesSrc)) {
		console.log('Copying article images to static directory...');

		// Clean old images
		if (existsSync(articleImagesDest)) {
			rmSync(articleImagesDest, { recursive: true, force: true });
		}

		// Create destination directory
		mkdirSync(join(STATIC_DIR, 'posts'), { recursive: true });
		mkdirSync(articleImagesDest, { recursive: true });

		copyDir(articleImagesSrc, articleImagesDest);
		console.log('Article images copied successfully!');
	}
}

console.log('Content fetched successfully!');

// ========================================
// Utility Functions
// ========================================

function copyDir(src, dest) {
	if (!existsSync(src)) return;
	mkdirSync(dest, { recursive: true });
	const entries = readdirSync(src);
	for (const entry of entries) {
		const srcPath = join(src, entry);
		const destPath = join(dest, entry);
		if (statSync(srcPath).isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			copyFileSync(srcPath, destPath);
		}
	}
}
