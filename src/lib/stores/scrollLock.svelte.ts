import { browser } from '$app/environment';

/**
 * 统一管理 body overflow 的全局 store。
 * 使用引用计数：多个组件可同时 lock，全部 unlock 后才恢复滚动。
 */
class ScrollLockStore {
	/** 当前锁定次数 */
	private count = $state(0);

	get locked(): boolean {
		return this.count > 0;
	}

	/** 锁定滚动（可多次调用，引用计数 +1） */
	lock(): void {
		this.count++;
		if (browser && this.count === 1) {
			document.body.style.overflow = 'hidden';
		}
	}

	/** 解锁（引用计数 -1，归零时恢复滚动） */
	unlock(): void {
		if (this.count === 0) return;
		this.count--;
		if (browser && this.count === 0) {
			document.body.style.overflow = '';
		}
	}

	/** 强制重置（组件卸载时兜底） */
	reset(): void {
		this.count = 0;
		if (browser) {
			document.body.style.overflow = '';
		}
	}
}

export const scrollLock = new ScrollLockStore();
