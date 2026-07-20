#!/usr/bin/env node
/**
 * 豆包分享链接图片下载脚本 (Node.js 版)
 * 自动获取分享链接中的原图URL并下载
 *
 * 使用方法:
 *   node scripts/download-doubao-images.mjs <分享链接> [--headless]
 *
 * 示例:
 *   node scripts/download-doubao-images.mjs https://www.doubao.com/thread/wb1c4cb94f3260d41
 *   node scripts/download-doubao-images.mjs https://www.doubao.com/thread/wb1c4cb94f3260d41 --headless
 *
 * 依赖: npm install puppeteer
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const LOG_DIR = join(ROOT_DIR, 'log');
const DOWNLOAD_DIR = join(ROOT_DIR, 'downloads');

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('使用方法: node scripts/download-doubao-images.mjs <分享链接> [--headless]');
    console.log('示例: node scripts/download-doubao-images.mjs https://www.doubao.com/thread/wb1c4cb94f3260d41');
    process.exit(1);
  }
  return {
    url: args.find((a) => !a.startsWith('--')),
    headless: args.includes('--headless'),
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractImages(html) {
  html = html.replace(/\\u002F/g, '/').replace(/\\\\u002F/g, '/');
  html = html.replace(/\\u0026/g, '&').replace(/\\\\u0026/g, '&');

  const allUrls = [...html.matchAll(/https://[^'"\\]+rc_gen_image\/[^'"\\]+/g)].map((m) => m[0]);

  const imageMap = new Map();

  for (let url of allUrls) {
    url = url.replace(/\\\//g, '/').replace(/\\\\/g, '');

    const idMatch = url.match(/rc_gen_image\/([a-f0-9]{32})/);
    if (!idMatch) continue;

    const id = idMatch[1];
    if (imageMap.has(id)) continue;

    if (url.includes('image_raw')) {
      imageMap.set(id, { id, url: url.replace(/&amp;/g, '&'), type: 'original' });
    } else if (url.includes('watermark')) {
      const origUrl = url
        .replace(/~tplv-a9rns2rl98-downsize_watermark_\d+_\d+_b\.png/, '~tplv-a9rns2rl98-image_raw_b.png')
        .replace(/&amp;/g, '&');
      imageMap.set(id, { id, url: origUrl, type: 'converted' });
    }
  }

  return [...imageMap.values()];
}

async function downloadImage(page, url, savePath) {
  try {
    const base64 = await page.evaluate(async (imgUrl) => {
      const res = await fetch(imgUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }, url);

    if (base64 && base64.includes(',')) {
      const data = Buffer.from(base64.split(',')[1], 'base64');
      await writeFile(savePath, data);
      return true;
    }
    return false;
  } catch (e) {
    console.error(`  ✗ 下载失败: ${e.message}`);
    return false;
  }
}

async function main() {
  const { url: shareUrl, headless } = parseArgs();

  console.log('='.repeat(60));
  console.log('豆包图片下载器 (Node.js)');
  console.log('='.repeat(60));

  let browser;
  try {
    const puppeteer = await import('puppeteer');
    console.log('[*] 启动浏览器...');
    browser = await puppeteer.default.launch({
      headless: headless,
      args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log(`[*] 正在访问分享页面: ${shareUrl}`);
    await page.goto(shareUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('[*] 等待页面加载...');
    await sleep(5000);

    const html = await page.content();
    console.log(`[*] 页面加载完成，大小: ${html.length} 字节`);

    const images = extractImages(html);
    console.log(`[+] 找到 ${images.length} 张图片`);

    if (images.length === 0) {
      console.log('[!] 未找到任何图片');
      return;
    }

    // 保存 URL 列表
    await mkdir(LOG_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const logFile = join(LOG_DIR, `image_urls_${timestamp}.json`);
    await writeFile(logFile, JSON.stringify(images, null, 2), 'utf-8');
    console.log(`[+] URL列表已保存到: ${logFile}`);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`共找到 ${images.length} 张图片:`);
    console.log('='.repeat(60));
    images.forEach((img, i) => {
      console.log(`\n[图片 ${i + 1}]`);
      console.log(`  ID: ${img.id}`);
      console.log(`  类型: ${img.type}`);
      console.log(`  URL: ${img.url.slice(0, 80)}...`);
    });

    // 下载图片
    await mkdir(DOWNLOAD_DIR, { recursive: true });
    console.log(`\n${'='.repeat(60)}`);
    console.log(`开始下载图片到: ${DOWNLOAD_DIR}`);
    console.log('='.repeat(60));

    let successCount = 0;
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const filename = `doubao_${img.id}.png`;
      const savePath = join(DOWNLOAD_DIR, filename);
      console.log(`\n[${i + 1}/${images.length}] 下载: ${filename}`);

      if (await downloadImage(page, img.url, savePath)) {
        console.log('  ✓ 下载成功');
        successCount++;
      }

      if (i < images.length - 1) await sleep(1000);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`下载完成! 成功: ${successCount}/${images.length}`);
    console.log(`文件保存在: ${DOWNLOAD_DIR}`);
    console.log('='.repeat(60));
  } catch (e) {
    if (e.message?.includes('Cannot find module')) {
      console.error('[!] 请先安装 puppeteer: npm install puppeteer');
    } else {
      console.error(`[!] 错误: ${e.message}`);
    }
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
