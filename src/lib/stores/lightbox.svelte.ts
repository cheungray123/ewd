import { browser } from '$app/environment';
import { scrollLock } from './scrollLock.svelte';

export interface LightboxItem {
	img: string;
	alt?: string;
	caption?: string;
}

/** 全局 Lightbox 状态（Svelte 5 Runes Store） */
class LightboxStore {
	open = $state(false);
	items = $state<LightboxItem[]>([]);
	current = $state(0);

	get active(): LightboxItem | null {
		return this.items[this.current] ?? null;
	}

	/** 打开灯箱，传入图片列表和起始索引 */
	show(items: LightboxItem[], startIndex = 0): void {
		if (!items.length) return;
		this.items = items;
		this.current = ((startIndex % items.length) + items.length) % items.length;
		this.open = true;
		if (browser) scrollLock.lock();
	}

	/** 关闭灯箱 */
	close(): void {
		this.open = false;
		if (browser) scrollLock.unlock();
	}

	/** 上一张 */
	prev(): void {
		if (!this.items.length) return;
		this.current = (this.current - 1 + this.items.length) % this.items.length;
	}

	/** 下一张 */
	next(): void {
		if (!this.items.length) return;
		this.current = (this.current + 1) % this.items.length;
	}
}

export const lightbox = new LightboxStore();

/** 便捷函数：打开单张图片的灯箱 */
export function openLightbox(img: string, alt?: string): void {
	lightbox.show([{ img, alt }]);
}
