// LeetCode 1181: Before and After Puzzle.
// Join two different positions i and j when the last word of phrase i equals the first word of phrase j.
// The shared word appears once in the merged phrase. Equal phrase text at two positions still counts as two phrases.

// Visualization cap (the draft did not verify official bounds).
const MAX_PHRASES = 12;
const MAX_WORDS = 6;

const CODE_LINES = [
  'FUNCTION beforeAndAfterPuzzles(phrases)',
  '    result ← empty set',
  '    FOR each position i in phrases',
  '        FOR each position j in phrases with j different from i',
  '            IF last word of phrases[i] equals first word of phrases[j] THEN',
  '                add phrases[i] joined with phrases[j] minus the repeated word to result',
  '    RETURN result sorted in lexicographic order',
];

const PY_LINES = [
  'class Solution:',
  '    def beforeAndAfterPuzzles(self, phrases: list[str]) -> list[str]:',
  '        result = set()',
  '        for i, first_phrase in enumerate(phrases):',
  '            for j, second_phrase in enumerate(phrases):',
  '                if i == j:',
  '                    continue',
  '                last_word = first_phrase.split()[-1]',
  '                first_word = second_phrase.split()[0]',
  '                if last_word == first_word:',
  '                    result.add(first_phrase + second_phrase[len(first_word):])',
  '        return sorted(result)',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    print(json.dumps(Solution().beforeAndAfterPuzzles(json.loads(sys.stdin.read()))))',
];

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));
export const python = PY_LINES.join('\n');

export const phases = [
  { id: 'setup', label: 'Phrases', description: 'Read the phrases and their positions.' },
  { id: 'pair', label: 'Pair', description: 'Compare the last word of one phrase with the first word of another.' },
  { id: 'join', label: 'Join', description: 'The words match, so add the merged phrase.' },
  { id: 'done', label: 'Answer', description: 'Report the distinct merged phrases in order.' },
];

const L = (text) => {
  const index = code.findIndex((entry) => entry.text.includes(text));
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`);
  return index + 1;
};

const P = (text) => {
  const index = PY_LINES.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Missing python line: ${text}`);
  return index + 1;
};

export function parseInput(input) {
  const phrases = typeof input === 'string' ? JSON.parse(input) : input;
  if (!Array.isArray(phrases) || phrases.length < 1 || phrases.length > MAX_PHRASES) {
    throw new Error(`Use a list of 1 to ${MAX_PHRASES} phrases.`);
  }
  for (const phrase of phrases) {
    if (typeof phrase !== 'string' || !/^[a-z]+( [a-z]+)*$/.test(phrase)) {
      throw new Error('Each phrase is lowercase words separated by single spaces.');
    }
    if (phrase.split(' ').length > MAX_WORDS) throw new Error(`Each phrase has at most ${MAX_WORDS} words.`);
  }
  return [...phrases];
}

export function buildTrace(input) {
  const phrases = parseInput(input);
  const words = phrases.map((phrase) => phrase.split(' '));
  const found = new Set();
  const frames = [];
  frames.push({
    pythonLine: P('result = set()'), phase: 'setup', activeLine: L('result ← empty set'),
    i: null, j: null, matched: null, merged: null, result: [], message: `${phrases.length} phrase${phrases.length === 1 ? '' : 's'} to compare in order.`,
  });
  for (let i = 0; i < phrases.length; i += 1) {
    for (let j = 0; j < phrases.length; j += 1) {
      if (i === j) continue;
      const last = words[i][words[i].length - 1];
      const first = words[j][0];
      const matched = last === first;
      if (!matched) {
        frames.push({
          pythonLine: P('if last_word == first_word:'), phase: 'pair', activeLine: L('IF last word of phrases[i] equals'),
          i, j, matched: false, merged: null, result: [...found].sort(),
          message: `"${last}" does not match "${first}", so ${i} and ${j} do not join.`,
        });
        continue;
      }
      const merged = phrases[i] + phrases[j].slice(first.length);
      const isNew = !found.has(merged);
      found.add(merged);
      frames.push({
        pythonLine: P('result.add('), phase: 'join', activeLine: L('add phrases[i] joined'),
        i, j, matched: true, merged, isNew, result: [...found].sort(),
        message: isNew
          ? `"${last}" matches, so the merged phrase "${merged}" joins the result.`
          : `"${last}" matches, and "${merged}" is already in the result.`,
      });
    }
  }
  const result = [...found].sort();
  frames.push({
    pythonLine: P('return sorted(result)'), phase: 'done', activeLine: L('RETURN result sorted'),
    i: null, j: null, matched: null, merged: null, result, message: `${result.length} distinct phrase${result.length === 1 ? '' : 's'} in lexicographic order.`,
  });
  return { input: phrases, answer: result, frames };
}
