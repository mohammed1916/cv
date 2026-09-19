export const code = [
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
