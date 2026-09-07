import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMicroLesson } from '../data/grammar/microLessons';
import { getGlossary, getLearnedWordIds, sortByKnownWords } from '../lib/grammarWordPool';
import { useAttemptStore } from '../store/useAttemptStore';
import { useSrsStore } from '../store/useSrsStore';

export default function GrammarMicroLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lesson = id ? getMicroLesson(id) : undefined;
  const states = useSrsStore(s => s.states);
  const addAttempt = useAttemptStore(s => s.add);
  const learnedWords = useMemo(() => getLearnedWordIds(states), [states]);
  const examples = useMemo(() => lesson ? sortByKnownWords(lesson.examples, learnedWords).slice(0, 3) : [], [learnedWords, lesson]);
  const exercises = useMemo(() => lesson ? sortByKnownWords(lesson.exercises, learnedWords).slice(0, 5) : [], [learnedWords, lesson]);

  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  if (!lesson) {
    return (
      <div className="p-8 text-center text-slate-400">
        微课不存在
        <button onClick={() => navigate('/grammar')} className="ml-2 text-blue-600">返回</button>
      </div>
    );
  }

  const exercise = exercises[exerciseIdx];
  const exerciseGlossary = exercise ? getGlossary(exercise.requiredWords, learnedWords, exercise.newWords) : [];
  const answeredAll = results.length === exercises.length;

  const answer = async (i: number) => {
    if (!exercise || choice !== null) return;
    setChoice(i);
    const correct = i === exercise.answer;
    setResults(r => [...r, correct]);
    await addAttempt({
      questionId: `micro:${lesson.id}:${exercise.id}`,
      section: 'vocabGrammar',
      correct,
      userAnswer: String(i),
      source: 'quiz',
    });
  };

  const next = () => {
    setChoice(null);
    setExerciseIdx(i => i + 1);
  };

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/grammar')} className="text-sm text-blue-600">返回语法列表</button>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">{lesson.category}</span>
          <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700">{lesson.minutes} 分钟</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-500">语法点：{lesson.point}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
        <p className="text-sm text-slate-500">{lesson.summary}</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-bold text-slate-800">先拿生活打个比方</h2>
        <p className="text-sm leading-relaxed text-slate-600">{lesson.analogy}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-bold text-slate-800">今天只记这一条</h2>
        <p className="text-sm leading-relaxed text-slate-600">{lesson.rule}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold text-slate-800">短句例子</h2>
          <span className="text-xs text-slate-400">优先使用已学词</span>
        </div>
        <div className="space-y-3">
          {examples.map((example, i) => {
            const glossary = getGlossary(example.requiredWords, learnedWords, example.newWords);
            return (
              <div key={i} className="rounded-lg bg-blue-50/60 p-3">
                <div className="text-sm font-medium text-blue-900">{example.en}</div>
                <div className="mt-1 text-xs text-slate-600">{example.zh}</div>
                {glossary.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {glossary.map(item => (
                      <span key={item.word} className="rounded bg-white px-2 py-0.5 text-xs text-slate-500">
                        {item.word} = {item.zh}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">马上练一下</h2>
          <span className="text-xs text-slate-400">{results.length} / {exercises.length}</span>
        </div>

        {answeredAll ? (
          <div className="space-y-4 py-5 text-center">
            <div className="text-lg font-semibold text-slate-800">
              答对 {results.filter(Boolean).length} / {results.length} 题
            </div>
            <p className="text-sm text-slate-500">{lesson.memoryHook}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => { setResults([]); setExerciseIdx(0); setChoice(null); }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
              >
                再练一次
              </button>
              <button
                onClick={() => navigate('/grammar')}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600"
              >
                返回列表
              </button>
            </div>
          </div>
        ) : exercise ? (
          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">
              {exerciseIdx + 1}. {exercise.prompt}
            </p>
            {exerciseGlossary.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {exerciseGlossary.map(item => (
                  <span key={item.word} className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                    {item.word} = {item.zh}
                  </span>
                ))}
              </div>
            )}
            <div className="grid gap-2">
              {exercise.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  className={`rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                    choice === null
                      ? 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                      : i === exercise.answer
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : choice === i
                          ? 'border-red-500 bg-red-50 text-red-600'
                          : 'border-slate-200 opacity-60'
                  }`}
                >
                  {String.fromCharCode(65 + i)}. {option}
                </button>
              ))}
            </div>

            {choice !== null && (
              <div className="mt-4 space-y-2">
                <p className={`text-sm font-medium ${choice === exercise.answer ? 'text-green-600' : 'text-red-500'}`}>
                  {choice === exercise.answer ? '回答正确' : `正确答案：${String.fromCharCode(65 + exercise.answer)}`}
                </p>
                <p className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                  {choice === exercise.answer ? exercise.correctFeedback : exercise.wrongFeedback}
                </p>
                {exerciseIdx + 1 < exercises.length ? (
                  <button onClick={next} className="w-full rounded-lg bg-blue-600 py-2.5 text-sm text-white">下一题</button>
                ) : (
                  <button onClick={next} className="w-full rounded-lg bg-green-600 py-2.5 text-sm text-white">看结果</button>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">这节微课还没有练习题。</p>
        )}
      </section>
    </div>
  );
}
