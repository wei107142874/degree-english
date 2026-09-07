import { ALL_WORDS } from '../data/words';
import type { GrammarNewWord, SrsState } from '../types';

const CORE_GRAMMAR_WORDS = new Set([
  'a',
  'an',
  'the',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'am',
  'is',
  'are',
  'do',
  'does',
  'not',
  'no',
  'yes',
]);

const WORD_MEANINGS = new Map(
  ALL_WORDS.map(w => [w.spelling.toLowerCase(), w.meanings[0] ?? ''])
);

export function getLearnedWordIds(states: Record<string, SrsState | undefined>): Set<string> {
  return new Set(
    Object.values(states)
      .filter((s): s is SrsState => !!s && s.level >= 1)
      .map(s => s.wordId.toLowerCase())
  );
}

export function wordNeedsGloss(word: string, learnedWords: Set<string>): boolean {
  const normalized = word.toLowerCase();
  return !CORE_GRAMMAR_WORDS.has(normalized) && !learnedWords.has(normalized);
}

export function unknownWordCount(requiredWords: readonly string[] | undefined, learnedWords: Set<string>): number {
  return (requiredWords ?? []).filter(word => wordNeedsGloss(word, learnedWords)).length;
}

export function sortByKnownWords<T extends { requiredWords?: string[] }>(items: readonly T[], learnedWords: Set<string>): T[] {
  return [...items].sort((a, b) => unknownWordCount(a.requiredWords, learnedWords) - unknownWordCount(b.requiredWords, learnedWords));
}

export function getGlossary(
  requiredWords: readonly string[] | undefined,
  learnedWords: Set<string>,
  extraWords: readonly GrammarNewWord[] = []
): GrammarNewWord[] {
  const glossary = new Map<string, string>();

  for (const item of extraWords) {
    glossary.set(item.word.toLowerCase(), item.zh);
  }

  for (const word of requiredWords ?? []) {
    if (!wordNeedsGloss(word, learnedWords)) continue;
    const normalized = word.toLowerCase();
    glossary.set(normalized, WORD_MEANINGS.get(normalized) || '新词');
  }

  return [...glossary.entries()].map(([word, zh]) => ({ word, zh }));
}
