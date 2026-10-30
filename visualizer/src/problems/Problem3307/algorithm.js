const PY = [
  "def kthCharacter(k, operations):",
  "    shift = 0",
  "    for t in range(len(operations), 0, -1):",
  "        half = 1 << (t - 1)",
  "        if k > half:",
  "            k -= half",
  "            if operations[t - 1] == 1:",
  "                shift += 1",
  "    return chr(ord(\"a\") + shift % 26)",
];

const at = text => {
  const index = PY.findIndex(line => line.includes(text));
  if (index < 0) throw new Error(`Missing Python line: ${text}`);
  return index + 1;
};

export const python = PY.join('\n');

export const code = [
  { line: 1, text: 'function kthCharacter(k, operations)' },
  { line: 2, text: 'shift = 0' },
  { line: 3, text: 'for t from the last operation back to the first' },
  { line: 4, text: 'half = length of the word before operation t' },
  { line: 5, text: 'if k is greater than half' },
  { line: 6, text: 'k = k - half' },
  { line: 7, text: 'if operation t is 1, add one to shift' },
  { line: 8, text: 'return the letter a shifted by shift modulo 26' },
];

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be JSON, for example {"k": 5, "operations": [0, 0, 0]}');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with k and operations');
  const { k, operations } = data;
  if (!Array.isArray(operations) || operations.length < 1 || operations.length > 100) {
    throw new Error('operations must be an array of 1 to 100 values');
  }
  if (operations.some(op => op !== 0 && op !== 1)) throw new Error('Each operation must be 0 or 1');
  if (!Number.isInteger(k) || k < 1 || k > 100000000000000) throw new Error('k must be an integer from 1 to 1e14');
  if (k > 2 ** operations.length) throw new Error(`The word after ${operations.length} operations has only ${2 ** operations.length} characters, fewer than k`);
  return { k, operations };
}

export function buildTrace(input) {
  const { operations } = input;
  let k = input.k;
  let shift = 0;
  const frames = [];
  const snap = (phase, activeLine, pythonLine, message, explanation, t) => frames.push({
    phase, activeLine, pythonLine, message, explanation, k, shift, operations, t, relatedLines: [activeLine],
  });

  snap('start', 2, at('shift = 0'), 'Start with shift = 0.', 'Work backward from the last operation.', operations.length);
  for (let t = operations.length; t >= 1; t--) {
    const half = 2 ** (t - 1);
    snap('step', 3, at('half = '), `Operation ${t} doubled a word of length ${2 * half}; half = ${half}.`, `Position ${k} is checked against the first half of length ${half}.`, t);
    if (k > half) {
      k -= half;
      snap('move', 6, at('k -= half'), `k is in the second half, so k becomes ${k}.`, 'The second half is a copy of the first half, so the position maps back.', t);
      if (operations[t - 1] === 1) {
        shift += 1;
        snap('shift', 7, at('shift += 1'), `Operation ${t} is type 1, so shift becomes ${shift}.`, 'Type 1 copies shift every letter forward by one.', t);
      }
    }
  }
  const result = String.fromCharCode(97 + (shift % 26));
  snap('done', 8, at('return chr'), `Answer: "${result}".`, 'After all steps, k = 1 refers to the letter a plus the total shift.', 0);
  return { input, result, frames };
}
