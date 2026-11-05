export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 9)) throw new Error('Each value is an integer from 1 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const counts = new Map()
  let sum = 0
  let best = 0
  let distinct = 0
  let l = 0
  for (let r = 0; r < nums.length; r++) {
    const x = nums[r]
    if ((counts.get(x) ?? 0) === 0) distinct++
    counts.set(x, (counts.get(x) ?? 0) + 1)
    sum += x
    if (r - l + 1 > k) {
      const y = nums[l]
      counts.set(y, counts.get(y) - 1)
      if (counts.get(y) === 0) distinct--
      sum -= y
      l++
    }
    if (r - l + 1 === k && distinct === k && sum > best) best = sum
    frames.push({ phase: 'slide', activeLine: CL('sum += x'), pythonLine: PL('total += x'), l, r, sum, distinct, best, message: r - l + 1 === k ? (distinct === k ? `Window ${l}..${r} has ${k} distinct values and sum ${sum}. Best so far ${best}.` : `Window ${l}..${r} repeats a value, so it does not count.`) : `Window ${l}..${r} is still growing toward length ${k}.` })
  }
  frames.push({ phase: 'done', activeLine: CL('return best'), pythonLine: PL('return best'), l: -1, r: -1, sum: 0, distinct: 0, best, message: `Best sum of ${k} distinct values in a row: ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const code = `function maxSumDistinctWindow(nums, k) {
  const counts = new Map();
  let sum = 0;
  let best = 0;
  let distinct = 0;
  let l = 0;
  for (let r = 0; r < nums.length; r++) {
    const x = nums[r];
    if ((counts.get(x) ?? 0) === 0) distinct++;
    counts.set(x, (counts.get(x) ?? 0) + 1);
    sum += x;
    if (r - l + 1 > k) {
      const y = nums[l];
      counts.set(y, counts.get(y) - 1);
      if (counts.get(y) === 0) distinct--;
      sum -= y;
      l++;
    }
    if (r - l + 1 === k && distinct === k && sum > best) best = sum;
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def max_sum_distinct_window(nums, k):
    counts = {}
    total = 0
    best = 0
    distinct = 0
    l = 0
    for r, x in enumerate(nums):
        if counts.get(x, 0) == 0:
            distinct += 1
        counts[x] = counts.get(x, 0) + 1
        total += x
        if r - l + 1 > k:
            y = nums[l]
            counts[y] -= 1
            if counts[y] == 0:
                distinct -= 1
            total -= y
            l += 1
        if r - l + 1 == k and distinct == k and total > best:
            best = total
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
