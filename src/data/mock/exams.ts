import type { MockExam } from '../../types';
import { DEFAULT_SECTION_CONFIG, examTotalPoints } from '../../lib/examConfig';
import {
  vocabGrammarQuestions,
  readingQuestions,
  clozeQuestions,
  translationENQuestions,
  translationCNQuestions,
  essayQuestions,
} from '../questions';

// 从题库按题型配比组装 5 套模拟卷（洗牌取题，保证每套不同）
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function buildExam(seed: number, id: string, title: string): MockExam {
  // 用 seed 做简单偏移，保证每套题不同
  const offset = seed * 7;
  const pick = <T,>(arr: T[], n: number): T[] => {
    const start = (offset * 3 + n) % Math.max(1, arr.length - n);
    return shuffle(arr).slice(start % Math.max(1, arr.length - n), (start % Math.max(1, arr.length - n)) + n);
  };
  const vocab = pick(vocabGrammarQuestions, 30);
  const read = pick(readingQuestions, 20);
  const cloze = pick(clozeQuestions, 10);
  const trEN = pick(translationENQuestions, 5);
  const trCN = pick(translationCNQuestions, 5);
  const writing = pick(essayQuestions, 1);

  const config = DEFAULT_SECTION_CONFIG.map(c => ({ ...c }));
  return {
    id,
    title,
    durationMin: 120,
    sections: config,
    questions: [...vocab, ...read, ...cloze, ...trEN, ...trCN, ...writing],
  };
}

// 预生成 5 套（模块加载时一次性生成，题目固定）
export const MOCK_EXAMS: MockExam[] = [
  buildExam(1, 'mock-1', '模拟卷（一）'),
  buildExam(2, 'mock-2', '模拟卷（二）'),
  buildExam(3, 'mock-3', '模拟卷（三）'),
  buildExam(4, 'mock-4', '模拟卷（四）'),
  buildExam(5, 'mock-5', '模拟卷（五）'),
];

export function getMockExam(id: string): MockExam | undefined {
  return MOCK_EXAMS.find(m => m.id === id);
}

export { examTotalPoints };
