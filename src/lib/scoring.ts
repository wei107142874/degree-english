import type { ExamSectionConfig, Question } from '../types';
import { examTotalPoints } from './examConfig';

export interface SectionScore {
  section: string;
  title: string;
  total: number;        // 该节题目数
  correct: number;
  points: number;       // 该节得分
  maxPoints: number;    // 该节满分
}

export interface ExamResult {
  totalScore: number;
  maxScore: number;
  sections: SectionScore[];
  correctRate: number;
  durationSec: number;
}

/** 评分：选择题按对错得分，翻译/写作按自评（展示参考答案，得分计 0 提示自评） */
export function scoreExam(
  answers: Record<string, { userAnswer: string; correct: boolean }>,
  questions: Question[],
  sections: ExamSectionConfig[],
  durationSec: number
): ExamResult {
  const sectionScores: SectionScore[] = sections.map(cfg => {
    const qs = questions.filter(q => q.section === cfg.section);
    const correct = qs.filter(q => answers[q.id]?.correct).length;
    const points = correct * cfg.points;
    return {
      section: cfg.section,
      title: cfg.title,
      total: qs.length,
      correct,
      points,
      maxPoints: cfg.count * cfg.points,
    };
  });

  const totalScore = sectionScores.reduce((s, x) => s + x.points, 0);
  const maxScore = examTotalPoints(sections);
  const answered = Object.keys(answers).length;
  const correctCount = sectionScores.reduce((s, x) => s + x.correct, 0);
  const rate = answered > 0 ? correctCount / answered : 0;

  return { totalScore, maxScore, sections: sectionScores, correctRate: rate, durationSec };
}
