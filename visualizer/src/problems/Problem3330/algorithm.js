const PY = [
  "def possibleStringCount(word):",
  "    total = 1",
  "    for i in range(1, len(word)):",
  "        if word[i] == word[i - 1]:",
  "            total += 1",
  "    return total",
];

const at = text => {
  const index = PY.findIndex(line => line.includes(text));
  if (index < 0) throw new Error(`Missing Python line: ${text}`);
  return index + 1;
};

export const python = PY.join('\n');

export const code = [
  { line: 1, text: 'function possibleOriginalCount(word)' },
  { line: 2, text: 'total = 1, counting the typed word itself' },
  { line: 3, text: 'for each position i from 1 to the end' },
  { line: 4, text: 'if word[i] equals word[i-1], it is a repeated letter' },
  { line: 5, text: 'total = total + 1' },
  { line: 6, text: 'return total' },
];

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be JSON, for example {"word": "abbcccc"}');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with word');
  const { word } = data;
  if (typeof word !== 'string' || !/^[a-z]+$/.test(word)) throw new Error('word must be lowercase English letters only');
  if (word.length < 1 || word.length > 100) throw new Error('word length must be from 1 to 100');
  return { word };
}

export function buildTrace(input) {
  const { word } = input;
  let total = 1;
  const frames = [];
  const snap = (phase, activeLine, pythonLine, message, explanation, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, explanation, word, total, index: -1, repeated: false, relatedLines: [activeLine], ...extra,
  });

  snap('start', 2, at('total = 1'), `Start with total = 1 for the word as typed.`, 'The typed word is always one possible original.');
  for (let i = 1; i < word.length; i++) {
    const repeated = word[i] === word[i - 1];
    snap('scan', 4, at('if word[i] == word[i - 1]'), `Compare word[${i}] = "${word[i]}" with word[${i - 1}] = "${word[i - 1]}".`,
      repeated ? 'The letters match, so this letter sits inside a run and could have been held one press less.' : 'The letters differ, so this position adds no new original.', { index: i, repeated });
    if (repeated) {
      total += 1;
      snap('count', 5, at('total += 1'), `total becomes ${total}.`, 'Shortening this run by one press gives one more possible original.', { index: i, repeated });
    }
  }
  snap('done', 6, at('return total'), `Result: ${total}.`, 'Only one mistake is allowed, so the answer is one plus the number of repeated adjacent letters.');
  return { input, result: total, frames };
}
