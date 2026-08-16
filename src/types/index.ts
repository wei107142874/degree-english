// ============ 核心类型定义 ============

// ---------- 单词 ----------
export interface Word {
  id: string;            // 唯一 id（用拼写做 id）
  spelling: string;      // 拼写
  phonetic?: string;     // 音标（美式）
  pos?: string;          // 词性，如 "n." "v." "adj."
  meanings: string[];    // 中文释义（可多个）
  examples: { en: string; zh: string }[]; // 例句 + 翻译
  tier: 1 | 2 | 3;       // 词档：1 核心高频 / 2 进阶 / 3 认知
}

// ---------- SRS 记忆状态 ----------
export interface SrsState {
  wordId: string;
  level: number;         // 0 未学 / 1..5 记忆等级
  interval: number;      // 当前间隔（天）
  due: number;           // 下次复习时间戳（ms）
  wrongCount: number;    // 累计错误次数
  reviewCount: number;   // 复习次数
  lastReview: number;    // 上次复习时间戳
  learnedAt?: number;    // 首次学到的日期戳（区分“今天新学”与“今天复习”）
  updatedAt?: number;    // 最后修改时间（局域网同步用）
}

// ---------- 语法 ----------
export interface GrammarQuiz {
  question: string;
  options: string[];
  answer: number;        // 正确选项下标
  explanation: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  category: string;      // 分类，如 "动词时态"
  summary: string;       // 一句话简介
  sections: {            // 讲义正文，分段
    heading: string;
    content: string[];   // 段落（支持中文讲解）
    examples?: { en: string; zh: string }[];
  }[];
  quiz: GrammarQuiz[];
}

// ---------- 题目 ----------
export type QuestionSection =
  | 'vocabGrammar'   // 词汇与语法
  | 'reading'        // 阅读理解
  | 'cloze'          // 完形填空
  | 'translationEN'  // 英译汉
  | 'translationCN'  // 汉译英
  | 'writing';       // 写作

export interface ReadingPassage {
  id: string;
  title: string;
  text: string;          // 文章正文（段落用 \n\n 分隔）
}

export interface Question {
  id: string;
  section: QuestionSection;
  passageId?: string;    // 阅读理解所属文章
  prompt: string;        // 题干（选择/完形）；翻译为原文；写作为题目要求
  options?: string[];    // 选择题选项；写作/翻译为空
  answer: string;        // 正确答案（选择题为选项下标字符串）；翻译为参考答案；写作为范文 id 或提示
  explanation: string;   // 中文解析
  source: 'builtin' | 'imported';
}

// ---------- 模拟考试 ----------
export interface ExamSectionConfig {
  section: QuestionSection;
  count: number;         // 题目数
  points: number;        // 每题分值
  title: string;         // 显示名
}

export interface MockExam {
  id: string;
  title: string;
  durationMin: number;   // 总时长（分钟）
  sections: ExamSectionConfig[];
  questions: Question[]; // 组装好的题
}

// ---------- 作答记录 ----------
export interface Attempt {
  id: string;
  questionId: string;
  section: QuestionSection;
  correct: boolean;
  userAnswer: string;
  ts: number;
  source: 'practice' | 'mock' | 'quiz';
  mockId?: string;
  updatedAt?: number;    // 最后修改时间（局域网同步用）
}

// ---------- 学习计划 ----------
export interface DailyTask {
  date: string;          // YYYY-MM-DD
  newWords: number;      // 计划新词数
  reviewWords: number;   // 计划复习词数
  grammarLessonId?: string;
  practiceSection?: QuestionSection;
  practiceCount?: number;
  mockExamId?: string;   // 该天做哪套模拟卷
  done: boolean;
  doneTs?: number;
}

export interface StudyPlan {
  id: string;            // 固定 'main'
  examDate: string;      // YYYY-MM-DD
  startDate: string;
  dailyGoal: number;     // 每日新词目标
  mode: 'standard' | 'sprint';
  tasks: DailyTask[];
  updatedAt?: number;    // 最后修改时间（局域网同步用）
}

// ---------- 设置 ----------
export interface Settings {
  id: string;              // 固定 'main'
  dailyNewWords: number;   // 每日新词目标
  examDate: string | null; // 考试日期 YYYY-MM-DD
  mockSectionConfig: ExamSectionConfig[]; // 模拟卷题型配置
  speakEngine: 'auto' | 'local' | 'online'; // 朗读引擎：自动/本地/在线
  wordOrderSeed?: string;  // 固定随机词序的种子（所有设备同种子 = 同顺序）
  updatedAt?: number;      // 最后修改时间（局域网同步用）
}
