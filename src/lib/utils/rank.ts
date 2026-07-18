export const RANK_LEVELS = [
	{ level: 19, label: '太师', grade: '正一品', min: 2000, color: '#bf8f00' },
	{ level: 18, label: '太尉', grade: '从一品', min: 1400, color: '#bf8f00' },
	{ level: 17, label: '知枢密院事', grade: '正二品', min: 1050, color: '#311b92' },
	{ level: 16, label: '节度使', grade: '从二品', min: 800, color: '#311b92' },
	{ level: 15, label: '御史中丞', grade: '正三品', min: 600, color: '#4a148c' },
	{ level: 14, label: '秘书监', grade: '从三品', min: 480, color: '#4a148c' },
	{ level: 13, label: '谏议大夫', grade: '正四品', min: 380, color: '#6a1b9a' },
	{ level: 12, label: '翰林侍读学士', grade: '从四品', min: 300, color: '#6a1b9a' },
	{ level: 11, label: '给事中', grade: '正五品', min: 240, color: '#880e4f' },
	{ level: 10, label: '知州', grade: '从五品', min: 190, color: '#880e4f' },
	{ level: 9, label: '起居舍人', grade: '正六品', min: 150, color: '#c62828' },
	{ level: 8, label: '通判', grade: '从六品', min: 115, color: '#c62828' },
	{ level: 7, label: '知县', grade: '正七品', min: 85, color: '#2e7d32' },
	{ level: 6, label: '殿中侍御史', grade: '从七品', min: 60, color: '#2e7d32' },
	{ level: 5, label: '大理寺评事', grade: '正八品', min: 40, color: '#558b2f' },
	{ level: 4, label: '诸州录事参军', grade: '从八品', min: 25, color: '#558b2f' },
	{ level: 3, label: '诸县主簿', grade: '正九品', min: 15, color: '#795548' },
	{ level: 2, label: '诸州司户参军', grade: '从九品', min: 5, color: '#795548' },
	{ level: 1, label: '庶民', grade: '', min: 0, color: '#9e9e9e' }
];

export interface CommentRank {
	level: number;
	label: string;
	grade: string;
	color: string;
}

const MASTER_RANK: CommentRank = { level: 99, label: '九梁帝王', grade: '', color: '#bf8f00' };
const NO_RANK: CommentRank = { level: 0, label: '', grade: '', color: '' };

export function getRank(commentCount: number | undefined): CommentRank {
	if (commentCount === undefined) return { ...NO_RANK };
	if (commentCount === -1) return { ...MASTER_RANK };
	if (commentCount < 0) return { ...NO_RANK };

	for (const r of RANK_LEVELS) {
		if (commentCount >= r.min) {
			return { level: r.level, label: r.label, grade: r.grade, color: r.color };
		}
	}
	return { ...NO_RANK };
}

export function getNextRank(
	commentCount: number
): { label: string; min: number; currentMin: number } | null {
	if (commentCount === undefined || commentCount < 0) return null;
	if (commentCount === -1) return null;

	for (let i = 0; i < RANK_LEVELS.length; i++) {
		if (commentCount >= RANK_LEVELS[i].min) {
			if (i > 0) {
				return {
					label: RANK_LEVELS[i - 1].label,
					min: RANK_LEVELS[i - 1].min,
					currentMin: RANK_LEVELS[i].min
				};
			}
			return null;
		}
	}
	return null;
}
