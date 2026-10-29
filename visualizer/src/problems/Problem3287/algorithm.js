const CODE = [
  "FUNCTION maxSequenceValue(nums, k)",
  "    n ← length(nums)",
  "    pre[i][0] ← {0} for every i; pre[0][c] ← {} for c > 0",
  "    FOR i FROM 1 TO n",
  "        FOR c FROM 1 TO k",
  "            pre[i][c] ← pre[i − 1][c] ∪ { a OR nums[i − 1] : a in pre[i − 1][c − 1] }",
  "    suf[i][c] ← the same rule computed from the right end of nums",
  "    best ← 0",
  "    FOR split FROM k TO n − k",
  "        FOR each a in pre[split][k] and b in suf[split][k]: best ← max(best, a XOR b)",
  "    RETURN best",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = `def maxSequenceValue(nums, k):
    n = len(nums)
    pre = [[set() for _ in range(k + 1)] for _ in range(n + 1)]
    for i in range(n + 1):
        pre[i][0] = {0}
    for i in range(1, n + 1):
        for c in range(1, k + 1):
            pre[i][c] = pre[i - 1][c] | {a | nums[i - 1] for a in pre[i - 1][c - 1]}
    suf = [[set() for _ in range(k + 1)] for _ in range(n + 1)]
    suf[n][0] = {0}
    for i in range(n - 1, -1, -1):
        suf[i][0] = {0}
        for c in range(1, k + 1):
            suf[i][c] = suf[i + 1][c] | {b | nums[i] for b in suf[i + 1][c - 1]}
    best = 0
    for split in range(k, n - k + 1):
        for a in pre[split][k]:
            for b in suf[split][k]:
                best = max(best, a ^ b)
    return best
`;
export const pythonLineMap = { 1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: 7, 7: 9, 8: 11, 9: 12, 10: 14, 11: 15 };

const snapshot = table => table.map(row => row.map(cell => (Array.isArray(cell) ? [...cell] : cell)));
function emit(frames, table, info, write = false) {
  if (write) table[info.row][info.column] = info.value;
  frames.push({ phase: info.phase, activeLine: info.line, message: info.message, row: info.row, column: info.column, value: info.value, table: snapshot(table) });
}

export function parseInput(text) {
  let data;
  try { data = typeof text === "string" ? JSON.parse(text) : text; }
  catch { throw new Error('Input must be valid JSON, for example {"nums": [4, 2, 5, 6, 7], "k": 2}.'); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with keys nums and k.");
  const { nums, k } = data;
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 20) throw new Error("nums must have 2 to 20 values (visualization cap; LeetCode allows up to 400).");
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 26)) throw new Error("Every value in nums must be an integer from 1 to 26.");
  if (!Number.isInteger(k) || k < 1 || 2 * k > nums.length) throw new Error("k must be an integer with 1 <= k and 2k <= nums.length.");
  return { nums, k };
}

const sorted = set => [...set].sort((a, b) => a - b);

export function buildTrace(input) {
  const { nums, k } = input;
  const n = nums.length;
  const pre = Array.from({ length: n + 1 }, () => Array.from({ length: k + 1 }, () => new Set()));
  const suf = Array.from({ length: n + 1 }, () => Array.from({ length: k + 1 }, () => new Set()));
  // Table rows are pick counts c, columns are prefix lengths i; cell = OR values of c picks inside nums[0..i-1].
  const table = Array.from({ length: k + 1 }, () => Array(n + 1).fill(null));
  const rowLabels = Array.from({ length: k + 1 }, (_, c) => `c=${c}`);
  const columnLabels = Array.from({ length: n + 1 }, (_, i) => `prefix ${i}`);
  const frames = [];
  for (let i = 0; i <= n; i++) { pre[i][0].add(0); table[0][i] = [0]; }
  for (let c = 1; c <= k; c++) table[c][0] = [];
  emit(frames, table, { phase: "setup", line: 3, row: 0, column: 0, value: [0], message: "Empty picks give OR value 0. Other prefixes of length 0 cannot hold picks." });
  for (let i = 1; i <= n; i++) {
    for (let c = 1; c <= k; c++) {
      for (const a of pre[i - 1][c]) pre[i][c].add(a);
      for (const a of pre[i - 1][c - 1]) pre[i][c].add(a | nums[i - 1]);
      table[c][i] = sorted(pre[i][c]);
      emit(frames, table, { phase: "prefix", line: 6, row: c, column: i, value: table[c][i], message: `Prefix ${i} with ${c} picks: OR values {${table[c][i].join(", ")}}.` });
    }
  }
  for (let i = n; i >= 0; i--) suf[i][0].add(0);
  for (let i = n - 1; i >= 0; i--) {
    for (let c = 1; c <= k; c++) {
      for (const b of suf[i + 1][c]) suf[i][c].add(b);
      for (const b of suf[i + 1][c - 1]) suf[i][c].add(b | nums[i]);
    }
  }
  emit(frames, table, { phase: "suffix", line: 7, row: k, column: n, value: table[k][n], message: "The matching suffix sets are built from the right the same way (not shown in the table)." });
  let best = 0;
  for (let split = k; split <= n - k; split++) {
    emit(frames, table, { phase: "combine", line: 9, row: k, column: split, value: table[k][split], message: `Split after index ${split - 1}: first half from the prefix, second half from the suffix.` });
    for (const a of pre[split][k]) for (const b of suf[split][k]) best = Math.max(best, a ^ b);
  }
  emit(frames, table, { phase: "result", line: 11, row: k, column: n, value: best, message: `Return the maximum value ${best}.` });
  return { input, result: best, frames, rowLabels, columnLabels };
}
