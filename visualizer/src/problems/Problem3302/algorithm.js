const PY = [
  "def lexicographicallySmallestValidSequence(word1, word2):",
  "    n, m = len(word1), len(word2)",
  "    last0 = [-1] * (m + 1)",
  "    last1 = [-1] * (m + 1)",
  "    last0[m] = n",
  "    last1[m] = n",
  "    for j in range(m - 1, -1, -1):",
  "        i = last0[j + 1] - 1",
  "        while i >= 0 and word1[i] != word2[j]:",
  "            i -= 1",
  "        last0[j] = max(i, -1)",
  "        i = last1[j + 1] - 1",
  "        while i >= 0 and word1[i] != word2[j]:",
  "            i -= 1",
  "        last1[j] = max(i, last0[j + 1] - 1, -1)",
  "    if last1[0] < 0:",
  "        return []",
  "    result = []",
  "    changed = False",
  "    prev = -1",
  "    for j in range(m):",
  "        i = prev + 1",
  "        while i < n:",
  "            if word1[i] == word2[j]:",
  "                limit = last0[j + 1] if changed else last1[j + 1]",
  "                if i < limit:",
  "                    break",
  "            if not changed and i < last0[j + 1]:",
  "                changed = True",
  "                break",
  "            i += 1",
  "        if i == n:",
  "            return []",
  "        result.append(i)",
  "        prev = i",
  "    return result",
];

const at = text => {
  const index = PY.findIndex(line => line.includes(text));
  if (index < 0) throw new Error(`Missing Python line: ${text}`);
  return index + 1;
};

export const python = PY.join('\n');

export const code = [
  { line: 1, text: 'function smallestValidIndexSequence(word1, word2)' },
  { line: 2, text: 'let n = length of word1 and m = length of word2' },
  { line: 3, text: 'set exact[m] = n and almost[m] = n' },
  { line: 4, text: 'for j from m-1 down to 0, set exact[j] = last index before exact[j+1] that matches word2[j]' },
  { line: 5, text: 'set almost[j] = max(last matching index before almost[j+1], exact[j+1] - 1)' },
  { line: 6, text: 'if almost[0] is negative, return empty' },
  { line: 7, text: 'prev = -1 and changed = false' },
  { line: 8, text: 'for j from 0 to m-1' },
  { line: 9, text: 'try i from prev+1 upward: exact match within bound, else one allowed mismatch' },
  { line: 10, text: 'append i to result and set prev = i' },
  { line: 11, text: 'return result' },
];

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be JSON, for example {"word1": "vbcca", "word2": "abc"}');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Input must be a JSON object with word1 and word2');
  }
  const { word1, word2 } = data;
  if (typeof word1 !== 'string' || !/^[a-z]+$/.test(word1)) throw new Error('word1 must be lowercase letters only');
  if (typeof word2 !== 'string' || !/^[a-z]+$/.test(word2)) throw new Error('word2 must be lowercase letters only');
  if (word1.length > 30) throw new Error(`word1 length (${word1.length}) exceeds the visualization limit of 30`);
  if (!(word2.length >= 1 && word2.length < word1.length)) throw new Error('Require 1 <= word2.length < word1.length');
  return { word1, word2 };
}

export function buildTrace(input) {
  const { word1, word2 } = input;
  const n = word1.length;
  const m = word2.length;
  const exact = Array(m + 1).fill(-1);
  const almost = Array(m + 1).fill(-1);
  exact[m] = n;
  almost[m] = n;
  const state = { j: -1, i: -1, prev: -1, changed: false, changedAt: -1, chosen: [] };
  const frames = [];
  const snap = (phase, activeLine, pythonLine, message, explanation) => frames.push({
    phase, activeLine, pythonLine, message, explanation, word1, word2, ...state,
    exact: [...exact], almost: [...almost], chosen: [...state.chosen], relatedLines: [activeLine],
  });

  snap('bounds', 3, at('last0[m] = n'), 'Start bounds: exact[m] and almost[m] are both n.', 'Past the end of word2, any position in word1 is allowed.');
  for (let j = m - 1; j >= 0; j--) {
    state.j = j;
    let i = exact[j + 1] - 1;
    while (i >= 0 && word1[i] !== word2[j]) i--;
    exact[j] = Math.max(i, -1);
    snap('bounds', 4, at('last0[j] = max'), `exact[${j}] = ${exact[j]}`, `Latest start for word2[${j}..] matched exactly with no change.`);
    let k = almost[j + 1] - 1;
    while (k >= 0 && word1[k] !== word2[j]) k--;
    almost[j] = Math.max(k, exact[j + 1] - 1, -1);
    snap('bounds', 5, at('last1[j] = max('), `almost[${j}] = ${almost[j]}`, `Latest start for word2[${j}..] allowing one mismatch.`);
  }

  if (almost[0] < 0) {
    snap('done', 6, at('if last1[0] < 0'), 'No valid sequence exists.', 'Even one allowed mismatch cannot match word2 as a subsequence.');
    return { input, result: [], frames };
  }
  snap('check', 6, at('if last1[0] < 0'), `almost[0] = ${almost[0]} is a valid start.`, 'A valid sequence exists, so the greedy scan can begin.');

  for (let j = 0; j < m; j++) {
    state.j = j;
    let i = state.prev + 1;
    let picked = -1;
    let usesChange = false;
    while (i < n) {
      state.i = i;
      snap('scan', 9, at('if word1[i] == word2[j]'), `Try index ${i} for word2[${j}] = "${word2[j]}".`, `Smallest index after ${state.prev} is tested first.`);
      if (word1[i] === word2[j]) {
        const limit = state.changed ? exact[j + 1] : almost[j + 1];
        if (i < limit) { picked = i; break; }
      }
      if (!state.changed && i < exact[j + 1]) { picked = i; usesChange = true; break; }
      i++;
    }
    if (picked < 0) {
      snap('done', 11, at('if i == n'), 'No index fits; this cannot happen after the check.', 'The bounds guarantee a pick.');
      return { input, result: [], frames };
    }
    if (usesChange) { state.changed = true; state.changedAt = picked; }
    state.prev = picked;
    state.chosen.push(picked);
    state.i = picked;
    snap('pick', 10, at('result.append(i)'), `Pick index ${picked} for word2[${j}].`, usesChange ? `word1[${picked}] is changed to "${word2[j]}" (the one allowed change).` : `word1[${picked}] already equals "${word2[j]}".`);
  }

  snap('done', 11, at('return result'), `Result: [${state.chosen.join(', ')}].`, 'This is the lexicographically smallest index sequence.');
  return { input, result: [...state.chosen], frames };
}
