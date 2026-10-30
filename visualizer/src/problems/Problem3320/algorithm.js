const PY = [
  "MOD = 10**9 + 7",
  "BEATS = {\"F\": \"E\", \"W\": \"F\", \"E\": \"W\"}",
  "",
  "def gain(bob, alice):",
  "    return int(BEATS[bob] == alice) - int(BEATS[alice] == bob)",
  "",
  "def countWinningSequences(s):",
  "    moves = \"FWE\"",
  "    n = len(s)",
  "    offset = n",
  "    dp = [[0] * (2 * n + 1) for _ in range(3)]",
  "    for b in range(3):",
  "        dp[b][gain(moves[b], s[0]) + offset] = 1",
  "    for i in range(1, n):",
  "        new = [[0] * (2 * n + 1) for _ in range(3)]",
  "        for last in range(3):",
  "            for d in range(2 * n + 1):",
  "                if dp[last][d] == 0:",
  "                    continue",
  "                for b in range(3):",
  "                    if b == last:",
  "                        continue",
  "                    nd = d + gain(moves[b], s[i])",
  "                    new[b][nd] = (new[b][nd] + dp[last][d]) % MOD",
  "        dp = new",
  "    return sum(dp[b][d] for b in range(3) for d in range(offset + 1, 2 * n + 1)) % MOD",
];

const at = text => {
  const index = PY.findIndex(line => line.includes(text));
  if (index < 0) throw new Error(`Missing Python line: ${text}`);
  return index + 1;
};

export const python = PY.join('\n');

export const code = [
  { line: 1, text: 'function countWinningSequences(s)' },
  { line: 2, text: 'moves are F, W, E; dp[move][diff] counts Bob sequences ending in move with score difference diff' },
  { line: 3, text: 'for each Bob move in the first round' },
  { line: 4, text: 'dp[move][gain of move against s[0]] = 1' },
  { line: 5, text: 'for each next round i' },
  { line: 6, text: 'new starts with all counts at zero' },
  { line: 7, text: 'for each previous move and each difference with a nonzero count' },
  { line: 8, text: 'for each Bob move different from the previous move' },
  { line: 9, text: 'new[move][difference + gain of move against s[i]] += count' },
  { line: 10, text: 'dp = new' },
  { line: 11, text: 'return the count of sequences whose final difference is positive, modulo 1000000007' },
];

const MOD = 1000000007;
const BEATS = { F: 'E', W: 'F', E: 'W' };
const gain = (bob, alice) => (BEATS[bob] === alice ? 1 : 0) - (BEATS[alice] === bob ? 1 : 0);

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be JSON, for example {"s": "FWEFW"}');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with s');
  const { s } = data;
  if (typeof s !== 'string' || !/^[FWE]+$/.test(s)) throw new Error('s must contain only the letters F, W, and E');
  if (s.length < 1 || s.length > 10) throw new Error(`s length (${s.length}) must be 1 to 10 for the visualization`);
  return { s };
}

export function buildTrace(input) {
  const { s } = input;
  const n = s.length;
  const offset = n;
  const moves = 'FWE';
  const width = 2 * n + 1;
  let dp = [0, 1, 2].map(() => Array(width).fill(0));
  const frames = [];
  const state = { round: 0, last: -1, answer: null };
  const snap = (phase, activeLine, pythonLine, message, explanation) => frames.push({
    phase, activeLine, pythonLine, message, explanation, s, moves, offset, dp: dp.map(row => row.slice()),
    ...state, relatedLines: [activeLine],
  });

  for (let b = 0; b < 3; b++) dp[b][gain(moves[b], s[0]) + offset] = 1;
  snap('start', 12, at('dp[b][gain(moves[b], s[0])'), `Round 1 for Alice's ${s[0]}: Bob can play each move once.`, 'Each first move starts a sequence with its own score difference.');

  for (let i = 1; i < n; i++) {
    state.round = i;
    const next = [0, 1, 2].map(() => Array(width).fill(0));
    for (let last = 0; last < 3; last++) {
      state.last = last;
      for (let d = 0; d < width; d++) {
        if (dp[last][d] === 0) continue;
        for (let b = 0; b < 3; b++) {
          if (b === last) continue;
          const nd = d + gain(moves[b], s[i]);
          next[b][nd] = (next[b][nd] + dp[last][d]) % MOD;
        }
      }
    }
    dp = next;
    snap('round', 15, at('new = [[0]'), `Round ${i + 1} against ${s[i]} is complete.`, `Bob cannot repeat the previous move, so each row counts sequences ending in that move.`);
  }

  state.answer = 0;
  for (let b = 0; b < 3; b++) for (let d = offset + 1; d < width; d++) state.answer = (state.answer + dp[b][d]) % MOD;
  state.round = n;
  snap('done', 11, at('return sum(dp'), `Winning sequences: ${state.answer}.`, 'Bob wins when his points exceed Alice points, so the difference must be positive.');
  return { input, result: state.answer, frames };
}
