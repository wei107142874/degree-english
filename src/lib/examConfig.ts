import type { ExamSectionConfig } from '../types';

// 四川师范大学学位英语常见题型配置（可调整）
// 总分 100：词汇语法 30 题 x1 分 + 阅读 20 题 x1.5 分 + 完形 10 空 x1 分 + 英译汉 5 句 x2 分 + 汉译英 5 句 x2 分 + 作文 1 篇 x10 分
export const DEFAULT_SECTION_CONFIG: ExamSectionConfig[] = [
  { section: 'vocabGrammar', count: 30, points: 1, title: '词汇与语法' },
  { section: 'reading', count: 20, points: 1.5, title: '阅读理解' },
  { section: 'cloze', count: 10, points: 1, title: '完形填空' },
  { section: 'translationEN', count: 5, points: 2, title: '英译汉' },
  { section: 'translationCN', count: 5, points: 2, title: '汉译英' },
  { section: 'writing', count: 1, points: 10, title: '写作' },
];

export const SECTION_LABELS: Record<string, string> = {
  vocabGrammar: '词汇与语法',
  reading: '阅读理解',
  cloze: '完形填空',
  translationEN: '英译汉',
  translationCN: '汉译英',
  writing: '写作',
};

export function examTotalPoints(sections: ExamSectionConfig[]): number {
  return Math.round(sections.reduce((s, c) => s + c.count * c.points, 0) * 10) / 10;
}
