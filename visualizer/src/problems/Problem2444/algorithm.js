export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums, minK and maxK.')
  const { nums, minK, maxK } = input
  if (nums.length < 1 || nums.length > 14) throw new Error('nums has 1 to 14 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 9)) throw new Error('Each value is an integer from 1 to 9.')
  if (!Number.isInteger(minK) || !Number.isInteger(maxK) || minK < 1 || maxK > 9 || minK > maxK) throw new Error('minK and maxK are integers from 1 to 9 with minK <= maxK.')
  return { nums, minK, maxK }
}

export function buildTrace({ nums, minK, maxK }) {
  const frames = []
  let count = 0
  let lastBad = -1
  let lastMin = -1
  let lastMax = -1
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    if (x < minK || x > maxK) lastBad = i
    if (x === minK) lastMin = i
    if (x === maxK) lastMax = i
    const add = Math.max(0, Math.min(lastMin, lastMax) - lastBad)
    count += add
    frames.push({ phase: add ? 'count' : 'skip', activeLine: CL('count += Math.max'), pythonLine: PL('count += max'), i, l: lastBad + 1, r: i, lastMin, lastMax, count, message: add ? `Subarrays ending at ${i} that keep every value in [${minK}, ${maxK}] and hold both bounds: ${add}.` : `Subarrays ending at ${i} cannot hold both bounds yet, so nothing is added.` })
  }
  frames.push({ phase: 'done', activeLine: CL('return count'), pythonLine: PL('return count'), i: -1, l: -1, r: -1, lastMin, lastMax, count, message: `${count} subarrays have minimum ${minK} and maximum ${maxK}.` })
  return { input: { nums, minK, maxK }, result: count, frames }
}

export const code = `function countFixedBounds(nums, minK, maxK) {
  let count = 0;
  let lastBad = -1;
  let lastMin = -1;
  let lastMax = -1;
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    if (x < minK || x > maxK) lastBad = i;
    if (x === minK) lastMin = i;
    if (x === maxK) lastMax = i;
    count += Math.max(0, Math.min(lastMin, lastMax) - lastBad);
  }
  return count;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def count_fixed_bounds(nums, min_k, max_k):
    count = 0
    last_bad = -1
    last_min = -1
    last_max = -1
    for i, x in enumerate(nums):
        if x < min_k or x > max_k:
            last_bad = i
        if x == min_k:
            last_min = i
        if x == max_k:
            last_max = i
        count += max(0, min(last_min, last_max) - last_bad)
    return count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
