import type { DailyTask, StudyPlan, QuestionSection } from '../types';

/** 生成从今天到考试日的每日学习计划 */
export function generatePlan(examDate: string, dailyNewWords: number, mode: 'standard' | 'sprint' = 'standard'): StudyPlan {
  const start = new Date();
  const exam = new Date(examDate + 'T00:00:00');
  const dayCount = Math.max(1, Math.round((exam.getTime() - start.getTime()) / 86400000) + 1);
  const startDate = toStamp(start);

  const tasks: DailyTask[] = [];
  const grammarIds = ['tense-voice', 'nonfinite', 'attributive-clause', 'noun-clause', 'adverbial-clause', 'subjunctive', 'inversion-emphasis', 'agreement', 'comparison', 'preposition', 'confusable', 'sentence-structure'];
  const practiceCycle: QuestionSection[] = ['vocabGrammar', 'reading', 'cloze', 'translationEN', 'translationCN'];

  for (let i = 0; i < dayCount; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const task: DailyTask = {
      date: toStamp(d),
      newWords: dailyNewWords,
      reviewWords: 0, // 复习量由 SRS 动态决定，显示当天到期数
      done: false,
    };
    // 语法：每 3 天安排一节
    const gi = Math.floor(i / 3);
    if (gi < grammarIds.length) task.grammarLessonId = grammarIds[gi];
    // 专项：每天一个题型，5 天一轮
    task.practiceSection = practiceCycle[i % practiceCycle.length];
    task.practiceCount = i % practiceCycle.length === 1 ? 10 : 15; // 阅读题少些
    // 冲刺模式：减少新词、增加模拟
    if (mode === 'sprint') {
      task.newWords = Math.max(15, Math.round(dailyNewWords * 0.5));
      task.practiceCount = 20;
    }
    tasks.push(task);
  }
  // 最后 7 天不安排新语法，做模拟卷（每 2 天一套，最多 5 套）
  const mockIds = ['mock-1', 'mock-2', 'mock-3', 'mock-4', 'mock-5'];
  let mi = 0;
  for (let i = Math.max(0, dayCount - 7); i < dayCount; i++) {
    if (i % 2 === 0 && mi < mockIds.length) {
      tasks[i].mockExamId = mockIds[mi++];
      tasks[i].newWords = Math.min(20, tasks[i].newWords);
    }
  }

  return { id: 'main', examDate, startDate, dailyGoal: dailyNewWords, mode, tasks };
}

export function toStamp(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 今日任务（若未生成计划则返回 null） */
export function todayTask(plan: StudyPlan | null): DailyTask | null {
  if (!plan) return null;
  const t = toStamp(new Date());
  return plan.tasks.find(tk => tk.date === t) ?? null;
}

/** 已完成天数 / 总天数 */
export function planProgress(plan: StudyPlan | null): { done: number; total: number } {
  if (!plan || plan.tasks.length === 0) return { done: 0, total: 0 };
  return { done: plan.tasks.filter(t => t.done).length, total: plan.tasks.length };
}

/** 距考试剩余天数 */
export function daysToExam(examDate: string | null): number | null {
  if (!examDate) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const exam = new Date(examDate + 'T00:00:00');
  return Math.max(0, Math.round((exam.getTime() - today.getTime()) / 86400000));
}
