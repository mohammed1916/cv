const CODE = [
  "FUNCTION countAlternatingSubarrays(nums)",
  "    total ← 0; streak ← 0",
  "    FOR i FROM 0 TO length(nums) − 1",
  "        IF i > 0 AND nums[i] ≠ nums[i−1] THEN streak ← streak + 1 ELSE streak ← 1",
  "        total ← total + streak",
  "    RETURN total",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = `def countAlternatingSubarrays(nums):
    total = 0
    streak = 0
    for i in range(len(nums)):
        if i > 0 and nums[i] != nums[i - 1]:
            streak += 1
        else:
            streak = 1
        total += streak
    return total
`;
export const pythonLineMap = { 1: 1, 2: 2, 3: 4, 4: 5, 5: 9, 6: 10 };

const snapshot = table => table.map(row => row.map(cell => (Array.isArray(cell) ? [...cell] : cell)));
function emit(frames, table, info, write = false) {
  if (write) table[info.row][info.column] = info.value;
  frames.push({ phase: info.phase, activeLine: info.line, message: info.message, row: info.row, column: info.column, value: info.value, table: snapshot(table) });
}

export function parseInput(text) {
  let data;
  try { data = typeof text === "string" ? JSON.parse(text) : text; }
  catch { throw new Error('Input must be valid JSON, for example {"nums": [0, 1, 1, 1]}.'); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with key nums.");
  const { nums } = data;
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50) throw new Error("nums must be an array of 1 to 50 values (visualization cap).");
  if (!nums.every(v => v === 0 || v === 1)) throw new Error("Every value in nums must be 0 or 1.");
  return { nums };
}

export function buildTrace(input) {
  const { nums } = input;
  const table = [nums.map(() => null), nums.map(() => null)];
  const rowLabels = ["streak ending here", "total so far"];
  const columnLabels = nums.map((v, i) => `${i}:${v}`);
  const frames = [];
  let total = 0, streak = 0;
  emit(frames, table, { phase: "setup", line: 2, row: 0, column: 0, value: 0, message: "Start with total = 0 and streak = 0." });
  for (let i = 0; i < nums.length; i++) {
    emit(frames, table, { phase: "scan", line: 3, row: 0, column: i, value: null, message: `Visit index ${i} with value ${nums[i]}.` });
    streak = i > 0 && nums[i] !== nums[i - 1] ? streak + 1 : 1;
    emit(frames, table, { phase: "compute", line: 4, row: 0, column: i, value: streak, message: i > 0 && nums[i] !== nums[i - 1] ? `Differs from the previous value, so streak = ${streak}.` : `Equal to the previous value (or first index), so streak resets to ${streak}.` }, true);
    total += streak;
    emit(frames, table, { phase: "compute", line: 5, row: 1, column: i, value: total, message: `Subarrays ending at ${i}: ${streak}. Running total ${total}.` }, true);
  }
  emit(frames, table, { phase: "result", line: 6, row: 1, column: nums.length - 1, value: total, message: `Return ${total}.` });
  return { input, result: total, frames, rowLabels, columnLabels };
}
