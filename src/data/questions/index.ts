import type { Question, ReadingPassage, QuestionSection } from '../../types';
import { vocabGrammar1Raw, buildMCQ as b1 } from './vocabGrammar1';
import { vocabGrammar2Raw, buildMCQ as b2 } from './vocabGrammar2';
import { reading1Raw, buildReading as br1 } from './reading1';
import { reading2Raw, buildReading as br2 } from './reading2';
import { reading3Raw, buildReading as br3 } from './reading3';
import { cloze1Raw, buildCloze as bc1 } from './cloze1';
import { cloze2Raw, buildCloze as bc2 } from './cloze2';
import { translationENRaw, buildTransEN } from './translationEN';
import { translationCNRaw, buildTransCN } from './translationCN';
import { essayRaw, buildEssay } from './essays';

// ---------- 词汇语法 ----------
export const vocabGrammarQuestions: Question[] = [
  ...vocabGrammar1Raw.map(b1),
  ...vocabGrammar2Raw.map(b2),
];

// ---------- 阅读理解 ----------
const readingBuilders = [br1, br2, br3];
export const readingPassages: ReadingPassage[] = [];
export const readingQuestions: Question[] = [];
[...reading1Raw, ...reading2Raw, ...reading3Raw].forEach((raw, i) => {
  const { passage, questions } = readingBuilders[i < 9 ? 0 : i < 17 ? 1 : 2](raw);
  readingPassages.push(passage);
  readingQuestions.push(...questions);
});

// ---------- 完形填空 ----------
export const clozePassages: ReadingPassage[] = [];
export const clozeQuestions: Question[] = [];
[...cloze1Raw, ...cloze2Raw].forEach((raw, i) => {
  const { passage, questions } = (i < 5 ? bc1 : bc2)(raw);
  clozePassages.push(passage);
  clozeQuestions.push(...questions);
});

// ---------- 翻译 ----------
export const translationENQuestions: Question[] = translationENRaw.map(buildTransEN);
export const translationCNQuestions: Question[] = translationCNRaw.map(buildTransCN);

// ---------- 写作 ----------
export const essayQuestions: Question[] = essayRaw.map(buildEssay);

// ---------- 汇总 ----------
export const ALL_QUESTIONS: Question[] = [
  ...vocabGrammarQuestions,
  ...readingQuestions,
  ...clozeQuestions,
  ...translationENQuestions,
  ...translationCNQuestions,
  ...essayQuestions,
];

export const ALL_PASSAGES: Record<string, ReadingPassage> = {};
[...readingPassages, ...clozePassages].forEach(p => { ALL_PASSAGES[p.id] = p });

export function getPassage(id?: string): ReadingPassage | undefined {
  return id ? ALL_PASSAGES[id] : undefined;
}

export function getQuestionsBySection(section: QuestionSection): Question[] {
  return ALL_QUESTIONS.filter(q => q.section === section);
}

export function findQuestion(id: string): Question | undefined {
  return ALL_QUESTIONS.find(q => q.id === id);
}

export const SECTION_COUNTS: Record<QuestionSection, number> = {
  vocabGrammar: vocabGrammarQuestions.length,
  reading: readingQuestions.length,
  cloze: clozeQuestions.length,
  translationEN: translationENQuestions.length,
  translationCN: translationCNQuestions.length,
  writing: essayQuestions.length,
};

export const SECTION_LABELS: Record<QuestionSection, string> = {
  vocabGrammar: '词汇与语法',
  reading: '阅读理解',
  cloze: '完形填空',
  translationEN: '英译汉',
  translationCN: '汉译英',
  writing: '写作',
};
