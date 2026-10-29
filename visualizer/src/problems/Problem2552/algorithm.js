const CODE = [
  "FUNCTION countIncreasingQuadruplets(nums)",
  "    n ← length(nums); total ← 0",
  "    FOR j FROM 1 TO n − 3",
  "        FOR k FROM j + 1 TO n − 2",
  "            IF nums[j] > nums[k] THEN",
  "                left ← count of i < j with nums[i] < nums[k]",
  "                right ← count of l > k with nums[l] > nums[j]",
  "                total ← total + left × right",
  "    RETURN total",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = `def countIncreasingQuadruplets(nums):
    n = len(nums)
    total = 0
    for j in range(1, n - 2):
        for k in range(j + 1, n - 1):
            if nums[j] > nums[k]:
                left = sum(1 for i in range(j) if nums[i] < nums[k])
                right = sum(1 for l in range(k + 1, n) if nums[l] > nums[j])
                total += left * right
    return total
`;
export const pythonLineMap = { 1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10 };

const snapshot = table => table.map(row => row.map(cell => (Array.isArray(cell) ? [...cell] : cell)));
function emit(frames, table, info, write = false) {
  if (write) table[info.row][info.column] = info.value;
  frames.push({ phase: info.phase, activeLine: info.line, message: info.message, row: info.row, column: info.column, value: info.value, table: snapshot(table) });
}

export function parseInput(text) {
  let data;
  try { data = typeof text === "string" ? JSON.parse(text) : text; }
  catch { throw new Error('Input must be valid JSON, for example {"nums": [1, 3, 2, 4, 5]}.'); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with key nums.");
  const { nums } = data;
  if (!Array.isArray(nums) || nums.length < 4 || nums.length > 12) throw new Error("nums must have 4 to 12 values (visualization cap; LeetCode allows up to 4000).");
  if (new Set(nums).size !== nums.length || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= nums.length)) throw new Error(`nums must be a permutation of 1 to ${nums.length}.`);
  return { nums };
}

export function buildTrace(input) {
  const { nums } = input;
  const n = nums.length;
  const table = Array.from({ length: n }, () => Array(n).fill(null));
  const rowLabels = nums.map((v, j) => `j=${j} (${v})`);
  const columnLabels = nums.map((v, k) => `k=${k} (${v})`);
  const frames = [];
  let total = 0;
  emit(frames, table, { phase: "setup", line: 2, row: 0, column: 0, value: 0, message: "Start with total = 0. Each cell (j, k) holds the number of quadruplets whose middle pair is j, k." });
  for (let j = 1; j <= n - 3; j++) {
    for (let k = j + 1; k <= n - 2; k++) {
      emit(frames, table, { phase: "scan", line: 4, row: j, column: k, value: null, message: `Check the middle pair j=${j}, k=${k}.` });
      if (nums[j] > nums[k]) {
        let left = 0, right = 0;
        for (let i = 0; i < j; i++) if (nums[i] < nums[k]) left++;
        for (let l = k + 1; l < n; l++) if (nums[l] > nums[j]) right++;
        const product = left * right;
        total += product;
        emit(frames, table, { phase: "compute", line: 8, row: j, column: k, value: product, message: `nums[${j}] > nums[${k}]: ${left} choices for i times ${right} choices for l = ${product}.` }, true);
      } else {
        emit(frames, table, { phase: "compute", line: 5, row: j, column: k, value: null, message: `nums[${j}] = ${nums[j]} is not greater than nums[${k}] = ${nums[k]}, so this pair cannot be the middle.` });
      }
    }
  }
  emit(frames, table, { phase: "result", line: 9, row: n - 1, column: n - 1, value: total, message: `Return ${total}.` });
  return { input, result: total, frames, rowLabels, columnLabels };
}
