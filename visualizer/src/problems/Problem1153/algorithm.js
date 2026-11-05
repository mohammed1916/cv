// LeetCode 1153: String Transforms Into Another String.
// Every operation replaces all copies of one letter with another letter, so each letter of str1 must map to
// one fixed letter of str2. A letter that maps to two different letters makes the transform impossible.
// If the mapping is consistent and str1 differs from str2, the transform works unless str2 already uses every
// letter of the alphabet: then no spare letter exists to break a cycle of replacements.

// Visualization cap (the draft did not verify official bounds).
const MAX_LENGTH = 12;
const ALPHABET = 26;

const CODE_LINES = `function canConvert(str1, str2) {
  if (str1 === str2) return true
  const mapping = new Map()
  for (let i = 0; i < str1.length; i++) {
    if (mapping.has(str1[i]) && mapping.get(str1[i]) !== str2[i]) return false
    mapping.set(str1[i], str2[i])
  }
  return new Set(str2).size < 26
}`.split('\n');

const PY_LINES = [
  'class Solution:',
  '    def canConvert(self, str1: str, str2: str) -> bool:',
  '        if str1 == str2:',
  '            return True',
  '        mapping = {}',
  '        for a, b in zip(str1, str2):',
  '            if mapping.get(a, b) != b:',
  '                return False',
  '            mapping[a] = b',
  '        return len(set(str2)) < 26',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(Solution().canConvert(data["str1"], data["str2"])))',
];

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));
export const python = PY_LINES.join('\n');

export const phases = [
  { id: 'setup', label: 'Strings', description: 'Read str1 and str2.' },
  { id: 'equal', label: 'Equal', description: 'No operation is needed when the strings already match.' },
  { id: 'map', label: 'Map letters', description: 'Each letter of str1 must always become the same letter of str2.' },
  { id: 'conflict', label: 'Conflict', description: 'One letter would need two different targets.' },
  { id: 'spare', label: 'Spare letter', description: 'Check whether str2 uses every letter of the alphabet.' },
  { id: 'done', label: 'Answer', description: 'Report whether the transform is possible.' },
];

const L = (text) => {
  const index = code.findIndex((entry) => entry.text.includes(text));
  if (index < 0) throw new Error(`Missing code line: ${text}`);
  return index + 1;
};

const P = (text) => {
  const index = PY_LINES.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Missing python line: ${text}`);
  return index + 1;
};

export function parseInput(input) {
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with str1 and str2.');
  const { str1, str2 } = data;
  if (typeof str1 !== 'string' || typeof str2 !== 'string' || str1.length < 1 || str1.length > MAX_LENGTH) {
    throw new Error(`str1 and str2 have 1 to ${MAX_LENGTH} lowercase letters.`);
  }
  if (str1.length !== str2.length) throw new Error('str1 and str2 have equal length.');
  if (!/^[a-z]+$/.test(str1) || !/^[a-z]+$/.test(str2)) throw new Error('Use lowercase letters only.');
  return { str1, str2 };
}

export function buildTrace(input, alphabetSize = ALPHABET) {
  const { str1, str2 } = parseInput(input);
  const frames = [];
  frames.push({
    pythonLine: P('if str1 == str2:'), phase: 'setup', activeLine: L('if (str1 === str2)'),
    index: -1, mapping: {}, conflict: null, used: null, verdict: null,
    message: `Can "${str1}" become "${str2}"?`,
  });
  if (str1 === str2) {
    frames.push({
      pythonLine: P('return True'), phase: 'equal', activeLine: L('if (str1 === str2)'),
      index: -1, mapping: {}, conflict: null, used: null, verdict: true,
      message: 'The strings already match, so zero operations are needed.',
    });
    frames.push({
      pythonLine: P('return True'), phase: 'done', activeLine: L('return true') || L('if (str1 === str2)'),
      index: -1, mapping: {}, conflict: null, used: null, verdict: true, message: 'Answer: true.',
    });
    return { input: { str1, str2 }, answer: true, frames };
  }
  const mapping = new Map();
  for (let i = 0; i < str1.length; i += 1) {
    const from = str1[i];
    const to = str2[i];
    if (mapping.has(from) && mapping.get(from) !== to) {
      frames.push({
        pythonLine: P('if mapping.get(a, b) != b:'), phase: 'conflict', activeLine: L('if (mapping.has(str1[i])'),
        index: i, mapping: Object.fromEntries(mapping), conflict: { from, to, was: mapping.get(from) }, used: null, verdict: false,
        message: `Position ${i}: ${from} must become ${to}, but it already becomes ${mapping.get(from)}.`,
      });
      frames.push({
        pythonLine: P('return False'), phase: 'done', activeLine: L('if (mapping.has(str1[i])'),
        index: i, mapping: Object.fromEntries(mapping), conflict: { from, to, was: mapping.get(from) }, used: null, verdict: false,
        message: 'Answer: false.',
      });
      return { input: { str1, str2 }, answer: false, frames };
    }
    mapping.set(from, to);
    frames.push({
      pythonLine: P('mapping[a] = b'), phase: 'map', activeLine: L('mapping.set(str1[i]'),
      index: i, mapping: Object.fromEntries(mapping), conflict: null, used: null, verdict: null,
      message: `Position ${i}: ${from} becomes ${to}.`,
    });
  }
  const used = [...new Set(str2)].sort();
  const full = used.length === alphabetSize;
  const verdict = !full;
  frames.push({
    pythonLine: P('return len(set(str2))'), phase: 'spare', activeLine: L('return new Set(str2).size < 26'),
    index: str1.length, mapping: Object.fromEntries(mapping), conflict: null, used, verdict,
    message: full
      ? `str2 uses all ${alphabetSize} letters, so no spare letter can break the cycle.`
      : `str2 uses ${used.length} of ${alphabetSize} letters, so a spare letter is free.`,
  });
  frames.push({
    pythonLine: P('return len(set(str2))'), phase: 'done', activeLine: L(verdict ? 'return new Set(str2).size < 26' : 'return new Set(str2).size < 26'),
    index: str1.length, mapping: Object.fromEntries(mapping), conflict: null, used, verdict,
    message: `Answer: ${verdict}.`,
  });
  return { input: { str1, str2 }, answer: verdict, frames };
}
