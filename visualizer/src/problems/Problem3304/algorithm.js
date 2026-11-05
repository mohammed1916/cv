const PY = [
  "def kthCharacter(k):",
  "    word = \"a\"",
  "    while len(word) < k:",
  "        shifted = \"\".join(chr((ord(c) - ord(\"a\") + 1) % 26 + ord(\"a\")) for c in word)",
  "        word = word + shifted",
  "    return word[k - 1]",
];

const at = text => {
  const index = PY.findIndex(line => line.includes(text));
  if (index < 0) throw new Error(`Missing Python line: ${text}`);
  return index + 1;
};

export const python = PY.join('\n');

export const code = `function kthCharacter(k) {
  let word = 'a'
  while (word.length < k) {
    const shifted = [...word].map(c => String.fromCharCode((c.charCodeAt(0) - 97 + 1) % 26 + 97)).join('')
    word = word + shifted
  }
  return word[k - 1]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => code.findIndex(c => c.text.includes(text)) + 1

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be JSON, for example {"k": 5}');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with k');
  const { k } = data;
  if (!Number.isInteger(k) || k < 1 || k > 500) throw new Error('k must be an integer from 1 to 500');
  return { k };
}

const shiftWord = word => [...word].map(c => String.fromCharCode((c.charCodeAt(0) - 97 + 1) % 26 + 97)).join('');

export function buildTrace(input) {
  const { k } = input;
  let word = 'a';
  const frames = [];
  const snap = (phase, activeLine, pythonLine, message, explanation, active = -1, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, explanation, k, word, active, length: word.length, relatedLines: [activeLine], ...extra,
  });

  snap('start', L("let word = 'a'"), at('word = "a"'), 'Start with word = "a".', 'Each round appends a shifted copy of the whole word.');
  while (word.length < k) {
    snap('check', L('while (word.length < k)'), at('while len(word)'), `Length ${word.length} is below k = ${k}.`, 'Keep extending while the word is too short.', k - 1);
    const shifted = shiftWord(word);
    snap('shift', L('const shifted'), at('shifted = '), `Shifted copy has ${shifted.length} characters.`, `Every character moves to the next letter; "z" wraps to "a".`, -1, { shifted });
    word = word + shifted;
    snap('append', L('word = word + shifted'), at('word = word + shifted'), `Word now has length ${word.length}.`, 'The appended copy doubles the length.', k - 1 < word.length ? k - 1 : -1);
  }
  const result = word[k - 1];
  snap('done', L('return word[k - 1]'), at('return word[k - 1]'), `Character at position ${k} is "${result}".`, `The word has length ${word.length}, so position ${k} exists.`, k - 1, { result });
  return { input, result, frames };
}
