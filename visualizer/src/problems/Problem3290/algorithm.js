const CODE = [
  "FUNCTION maxMultiplicationScore(a, b)",
  "    m ← length(a); n ← length(b)",
  "    dp[0][j] ← 0 for every j; dp[t][j] ← unreachable for t ≥ 1",
  "    FOR t FROM 1 TO m",
  "        FOR j FROM 1 TO n",
  "            dp[t][j] ← dp[t][j − 1]",
  "            IF dp[t − 1][j − 1] is reachable THEN dp[t][j] ← max(dp[t][j], dp[t − 1][j − 1] + a[t − 1] × b[j − 1])",
  "    RETURN dp[m][n]",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = `def maxMultiplicationScore(a, b):
    m, n = len(a), len(b)
    NEG = float("-inf")
    dp = [[NEG] * (n + 1) for _ in range(m + 1)]
    for j in range(n + 1):
        dp[0][j] = 0
    for t in range(1, m + 1):
        for j in range(1, n + 1):
            dp[t][j] = dp[t][j - 1]
            if dp[t - 1][j - 1] != NEG:
                dp[t][j] = max(dp[t][j], dp[t - 1][j - 1] + a[t - 1] * b[j - 1])
    return dp[m][n]
`;
export const pythonLineMap = { 1: 1, 2: 2, 3: 6, 4: 7, 5: 8, 6: 9, 7: 11, 8: 12 };

const snapshot = table => table.map(row => row.map(cell => (Array.isArray(cell) ? [...cell] : cell)));
function emit(frames, table, info, write = false) {
  if (write) table[info.row][info.column] = info.value;
  frames.push({ phase: info.phase, activeLine: info.line, message: info.message, row: info.row, column: info.column, value: info.value, table: snapshot(table) });
}

export function parseInput(text) {
  let data;
  try { data = typeof text === "string" ? JSON.parse(text) : text; }
  catch { throw new Error('Input must be valid JSON, for example {"a": [3, 2, 5, 6], "b": [2, -6, 4, -5, -3, 2, -7]}.'); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with keys a and b.");
  const { a, b } = data;
  if (!Array.isArray(a) || a.length !== 4 || !a.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error("a must be an array of exactly 4 integers, each between -100 and 100.");
  if (!Array.isArray(b) || b.length < 4 || b.length > 20 || !b.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error("b must be an array of 4 to 20 integers, each between -100 and 100 (visualization cap).");
  return { a, b };
}

export function buildTrace(input) {
  const { a, b } = input;
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
  const rowLabels = Array.from({ length: m + 1 }, (_, t) => `first ${t} picks`);
  const columnLabels = Array.from({ length: n + 1 }, (_, j) => `b[0..${j - 1}]`);
  const frames = [];
  for (let j = 0; j <= n; j++) dp[0][j] = 0;
  emit(frames, dp, { phase: "setup", line: 3, row: 0, column: 0, value: 0, message: "With zero picks the score is 0 for every prefix of b." });
  for (let t = 1; t <= m; t++) {
    for (let j = 1; j <= n; j++) {
      dp[t][j] = dp[t][j - 1];
      emit(frames, dp, { phase: "skip", line: 6, row: t, column: j, value: dp[t][j], message: `Skip b[${j - 1}] = ${b[j - 1]}: best of ${t} picks within b[0..${j - 2}].` });
      if (dp[t - 1][j - 1] !== null) {
        const candidate = dp[t - 1][j - 1] + a[t - 1] * b[j - 1];
        dp[t][j] = dp[t][j] === null ? candidate : Math.max(dp[t][j], candidate);
        emit(frames, dp, { phase: "take", line: 7, row: t, column: j, value: dp[t][j], message: `Take b[${j - 1}] as pick ${t}: ${dp[t - 1][j - 1]} + ${a[t - 1]} × ${b[j - 1]} = ${candidate}; keep the best.` }, true);
      } else {
        emit(frames, dp, { phase: "take", line: 7, row: t, column: j, value: dp[t][j], message: `Taking b[${j - 1}] as pick ${t} is impossible (not enough earlier picks).` });
      }
    }
  }
  const result = dp[m][n];
  emit(frames, dp, { phase: "result", line: 8, row: m, column: n, value: result, message: `Return ${result}.` });
  return { input, result, frames, rowLabels, columnLabels };
}
