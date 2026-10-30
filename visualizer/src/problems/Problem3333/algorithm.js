const PY = [
  "MOD = 10**9 + 7",
  "",
  "def possibleStringCount(word, k):",
  "    runs = []",
  "    for ch in word:",
  "        if runs and runs[-1][0] == ch:",
  "            runs[-1][1] += 1",
  "        else:",
  "            runs.append([ch, 1])",
  "    total = 1",
  "    for _, length in runs:",
  "        total = total * length % MOD",
  "    ways = [0] * k",
  "    ways[0] = 1",
  "    for _, length in runs:",
  "        prefix = [0] * (k + 1)",
  "        for s in range(k):",
  "            prefix[s + 1] = (prefix[s] + ways[s]) % MOD",
  "        nxt = [0] * k",
  "        for s in range(k):",
  "            low = max(0, s - length)",
  "            nxt[s] = (prefix[s] - prefix[low]) % MOD",
  "        ways = nxt",
  "    short = sum(ways) % MOD",
  "    return (total - short) % MOD",
];

const at = text => {
  const index = PY.findIndex(line => line.includes(text));
  if (index < 0) throw new Error(`Missing Python line: ${text}`);
  return index + 1;
};

export const python = PY.join('\n');

export const code = [
  { line: 1, text: 'function countOriginals(word, k)' },
  { line: 2, text: 'split word into runs of equal letters with lengths L' },
  { line: 3, text: 'total = product of all run lengths' },
  { line: 4, text: 'ways[0] = 1 and every other sum is 0' },
  { line: 5, text: 'for each run with length L' },
  { line: 6, text: 'for each sum s below k, new[s] = sum of ways[s-l] for l from 1 to L' },
  { line: 7, text: 'ways = new' },
  { line: 8, text: 'short = sum of ways[s] for all sums s below k' },
  { line: 9, text: 'return total minus short, modulo 1000000007' },
];

const MOD = 1000000007;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be JSON, for example {"word": "aaabbb", "k": 3}');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with word and k');
  const { word, k } = data;
  if (typeof word !== 'string' || !/^[a-z]+$/.test(word)) throw new Error('word must be lowercase English letters only');
  if (word.length < 1 || word.length > 40) throw new Error(`word length (${word.length}) must be 1 to 40 for the visualization`);
  if (!Number.isInteger(k) || k < 1 || k > 40) throw new Error('k must be an integer from 1 to 40 for the visualization');
  return { word, k };
}

export function buildTrace(input) {
  const { word, k } = input;
  const runs = [];
  for (const ch of word) {
    if (runs.length && runs[runs.length - 1].letter === ch) runs[runs.length - 1].length += 1;
    else runs.push({ letter: ch, length: 1 });
  }
  let total = 1;
  for (const run of runs) total = (total * run.length) % MOD;

  const frames = [];
  let ways = Array(k).fill(0);
  ways[0] = 1;
  const table = [ways.slice()];
  const state = { run: 0, sum: 0, total, short: null, result: null, label: 'start' };
  const snap = (phase, activeLine, pythonLine, message, explanation) => frames.push({
    phase, activeLine, pythonLine, message, explanation, k, runs: runs.map(r => ({ ...r })),
    table: table.map(row => row.slice()), ...state, relatedLines: [activeLine],
  });

  snap('start', 4, at('ways[0] = 1'), 'Start with one way to have total length 0.', 'The table row is the number of ways to reach each total length after some runs.');
  runs.forEach((run, r) => {
    state.run = r + 1;
    state.label = `${run.letter} x${run.length}`;
    const prefix = Array(k + 1).fill(0);
    for (let s = 0; s < k; s++) prefix[s + 1] = (prefix[s] + ways[s]) % MOD;
    const nxt = Array(k).fill(0);
    for (let s = 0; s < k; s++) {
      state.sum = s;
      const low = Math.max(0, s - run.length);
      nxt[s] = (prefix[s] - prefix[low] + MOD) % MOD;
      snap('run', 6, at('nxt[s] = '), `Run ${run.letter} x${run.length} at total ${s}: ${nxt[s]} ways.`,
        `Keep this run at length 1 to ${run.length}; the previous total must lie in [${low}, ${s - 1}].`);
    }
    ways = nxt;
    table.push(ways.slice());
    snap('row', 7, at('ways = nxt'), `Finished run ${run.letter} x${run.length}.`, 'The new row replaces the old one.');
  });

  const short = ways.reduce((sum, value) => (sum + value) % MOD, 0);
  state.short = short;
  snap('finish', 8, at('short = sum(ways)'), `Ways with total length below ${k}: ${short}.`, 'These originals are too short and must be excluded.');
  const result = (total - short + MOD) % MOD;
  state.result = result;
  snap('done', 9, at('return (total - short)'), `Answer: ${result}.`, 'All originals minus the too-short ones.');
  return { input, result, frames };
}
