const CODE = [
  "FUNCTION countGoodSplits(nums)",
  "    ways[0] ← 1, and ways[i] ← 0 for every other prefix length i",
  "    FOR i FROM 1 TO length(nums)",
  "        FOR j FROM 0 TO i − 1",
  "            IF nums[j..i−1] contains exactly one 1 THEN",
  "                ways[i] ← ways[i] + ways[j]",
  "    RETURN ways[length(nums)] mod 1000000007",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = `def goodSplits(nums):
    MOD = 10**9 + 7
    ways = [0] * (len(nums) + 1)
    ways[0] = 1
    for i in range(1, len(nums) + 1):
        for j in range(i):
            if sum(nums[j:i]) == 1:
                ways[i] += ways[j]
    return ways[len(nums)] % MOD
`;
export const pythonLineMap = { 1: 1, 2: 3, 3: 5, 4: 6, 5: 7, 6: 8, 7: 9 };

const snapshot = table => table.map(row => row.map(cell => (Array.isArray(cell) ? [...cell] : cell)));
function emit(frames, table, info, write = false) {
  if (write) table[info.row][info.column] = info.value;
  frames.push({ phase: info.phase, activeLine: info.line, message: info.message, row: info.row, column: info.column, value: info.value, table: snapshot(table) });
}

export function parseInput(text) {
  let data;
  try { data = typeof text === "string" ? JSON.parse(text) : text; }
  catch { throw new Error('Input must be valid JSON, for example {"nums": [0, 1, 0, 0, 1]}.'); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with key nums.");
  const { nums } = data;
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50) throw new Error("nums must be an array of 1 to 50 values (visualization cap).");
  if (!nums.every(v => v === 0 || v === 1)) throw new Error("Every value in nums must be 0 or 1.");
  return { nums };
}

export function buildTrace(input) {
  const { nums } = input;
  const n = nums.length;
  const rowLabels = ["ways"];
  const columnLabels = Array.from({ length: n + 1 }, (_, i) => `prefix ${i}`);
  const table = [Array(n + 1).fill(null)];
  const frames = [];
  const ways = Array(n + 1).fill(0);
  ways[0] = 1;
  emit(frames, table, { phase: "setup", line: 2, row: 0, column: 0, value: 1, message: "One way to split the empty prefix." }, true);
  for (let i = 1; i <= n; i++) {
    ways[i] = 0;
    emit(frames, table, { phase: "loop", line: 3, row: 0, column: i, value: 0, message: `Count good splits of the prefix of length ${i}.` }, true);
    for (let j = 0; j < i; j++) {
      const ones = nums.slice(j, i).reduce((a, b) => a + b, 0);
      if (ones === 1) {
        ways[i] += ways[j];
        emit(frames, table, { phase: "check", line: 5, row: 0, column: i, value: ways[i], message: `nums[${j}..${i - 1}] has exactly one 1, so add ways[${j}] = ${ways[j]}.` }, true);
      } else {
        emit(frames, table, { phase: "check", line: 4, row: 0, column: i, value: ways[i], message: `nums[${j}..${i - 1}] has ${ones} ones, so skip j = ${j}.` });
      }
    }
  }
  const result = ways[n] % 1000000007;
  emit(frames, table, { phase: "result", line: 7, row: 0, column: n, value: result, message: `Return ${result} (ways for the whole array, mod 1e9+7).` });
  return { input, result, frames, rowLabels, columnLabels };
}
