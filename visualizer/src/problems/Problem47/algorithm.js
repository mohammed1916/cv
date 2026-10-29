export const legacyCode = [
  'def permuteUnique(nums):',
  '    nums = sorted(nums)',
  '    result, path = [], []',
  '    used = [False] * len(nums)',
  '    def backtrack():',
  '        if len(path) == len(nums):',
  '            result.append(path[:])',
  '            return',
  '        for i in range(len(nums)):',
  '            if used[i]:',
  '                continue',
  '            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:',
  '                continue',
  '            path.append(nums[i]); used[i] = True',
  '            backtrack()',
  '            path.pop(); used[i] = False',
  '    backtrack()',
  '    return result',
].map((text, index) => ({ line: index + 1, text }));
export const linePatterns = { 2: 'init', 7: 'result', 11: 'skip', 13: 'skip', 14: 'add', 16: 'remove', 18: 'done' };
export const TRACE_LIMIT = 12000;

export function buildPermutations(values) {
  let input;
  try { input = JSON.parse(values.nums); } catch { throw new Error('Enter an integer array, such as [1,1,2].'); }
  if (!Array.isArray(input) || input.length < 1 || input.length > 8 || input.some(n => !Number.isInteger(n) || n < -10 || n > 10)) throw new Error('Use 1–8 integers, each between -10 and 10.');
  const nums = [...input].sort((a, b) => a - b), results = [], frames = [], path = [], used = Array(nums.length).fill(false);
  let eventCount = 0;
  const push = (activeLine, candidate, message) => {
    eventCount++;
    if (frames.length < TRACE_LIMIT || activeLine === 18) frames.push({ activeLine, candidate, phase: linePatterns[activeLine], path: [...path], resultCount: results.length, message });
  };
  push(2, -1, 'Sort the values so equal copies are adjacent. Each copy keeps its own index.');
  function backtrack() {
    if (path.length === nums.length) {
      results.push(path.map(index => nums[index]));
      push(7, -1, `Save unique permutation #${results.length}.`);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) { push(11, i, `Index ${i} is already in the path: skip it.`); continue; }
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) {
        push(13, i, `Skip copy [${i}]: equal copy [${i - 1}] is unused. Taking this one first would repeat the same branch.`);
        continue;
      }
      path.push(i); used[i] = true;
      push(14, i, `Choose ${nums[i]} from index ${i}. Equal copies are allowed when the earlier copy is already used.`);
      backtrack();
      path.pop(); used[i] = false;
      push(16, i, `Undo index ${i}: remove its last path entry and make it available again.`);
    }
  }
  backtrack();
  push(18, -1, `Return all ${results.length} unique permutations.`);
  return { input: { nums: input }, nums, results, frames, eventCount, truncated: eventCount > TRACE_LIMIT + 1 };
}

// ---- Permutations II (statement-sourced; see scratch statements/47.md) ----
export function parseInput(text) {
  let nums = text
  if (typeof nums === 'string') {
    try { nums = JSON.parse(nums) } catch { throw new Error('Use a JSON array of integers, such as [1,1,2].') }
  }
  if (nums && typeof nums === 'object' && !Array.isArray(nums) && 'nums' in nums) nums = nums.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6) throw new Error('Use an array of 1 to 6 integers (the visualization caps the size).')
  if (nums.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error('Values are integers from -10 to 10.')
  return nums
}

// buildPermutations owns the story frames (event limit, copies, path). Each frame is mapped to the pseudocode line in `code`.
const PSEUDO_LINE_FOR_LEGACY = { 2: 2, 7: 8, 11: 10, 13: 11, 14: 12, 16: 14, 18: 5 }

export function buildTrace(input) {
  const story = buildPermutations({ nums: JSON.stringify(parseInput(input)) })
  const frames = story.frames.map(frame => ({
    ...frame,
    legacyLine: frame.activeLine,
    activeLine: PSEUDO_LINE_FOR_LEGACY[frame.activeLine],
    explanation: frame.message,
  }))
  return { input: story.input.nums, nums: story.nums, results: story.results, truncated: story.truncated, result: story.results, frames }
}

export const code = `permute unique (nums):
  sort nums so equal values are next to each other
  set used flags to all false
  call backtrack with an empty path
  return the list of recorded permutations

backtrack():
  if the path has every value then record a copy of it
  for each index i in nums:
    if index i is already used then continue
    if nums[i] equals nums[i - 1] and nums[i - 1] is not used then skip it
    mark index i as used and add nums[i] to the path
    call backtrack
    remove the last value from the path and unmark index i`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def permute_unique(nums):
    nums = sorted(nums)
    used = [False] * len(nums)
    path = []
    result = []

    def backtrack():
        if len(path) == len(nums):
            result.append(list(path))
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack()
            path.pop()
            used[i] = False

    backtrack()
    return result
`

// Maps each pseudocode activeLine to the Python line that performs the same action.
export const pythonLineMap = {
  2: 2,
  3: 3,
  4: 22,
  5: 23,
  7: 7,
  8: 8,
  9: 11,
  10: 12,
  11: 14,
  12: 16,
  13: 18,
  14: 19,
}
