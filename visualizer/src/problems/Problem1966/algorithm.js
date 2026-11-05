// LeetCode 1966: a value is found for every pivot order exactly when everything to its left is smaller and everything to its right is larger. Prefix maxima and suffix minima check this in linear time.
const SOURCE = [
  "function binarySearchableCount(nums) {",
  "  const n = nums.length",
  "  const leftMax = new Array(n).fill(-Infinity), rightMin = new Array(n).fill(Infinity)",
  "  for (let i = 1; i < n; i++) leftMax[i] = Math.max(leftMax[i - 1], nums[i - 1])",
  "  for (let i = n - 2; i >= 0; i--) rightMin[i] = Math.min(rightMin[i + 1], nums[i + 1])",
  "  let count = 0",
  "  for (let i = 0; i < n; i++) {",
  "    if (leftMax[i] < nums[i] && nums[i] < rightMin[i]) count++",
  "  }",
  "  return count",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def binary_searchable_count(nums):
    n = len(nums)
    left_max = [float("-inf")] * n
    right_min = [float("inf")] * n
    for i in range(1, n):
        left_max[i] = max(left_max[i - 1], nums[i - 1])
    for i in range(n - 2, -1, -1):
        right_min[i] = min(right_min[i + 1], nums[i + 1])
    count = 0
    for i in range(n):
        if left_max[i] < nums[i] < right_min[i]:
            count += 1
    return count
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'prefix', label: 'Prefix maxima', description: 'Largest value to the left of each position.' },
  { id: 'suffix', label: 'Suffix minima', description: 'Smallest value to the right of each position.' },
  { id: 'check', label: 'Check each', description: 'A value is guaranteed when the left maximum is below it and the right minimum is above it.' },
  { id: 'done', label: 'Result', description: 'Count of guaranteed values.' },
]

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Enter a JSON array of distinct integers, for example [1,3,2].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 10000) || new Set(nums).size !== nums.length) throw new Error('Use 1 to 12 distinct integers.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const leftMax = new Array(n).fill(-Infinity)
  const rightMin = new Array(n).fill(Infinity)
  const frames = []
  for (let i = 1; i < n; i++) {
    leftMax[i] = Math.max(leftMax[i - 1], nums[i - 1])
    frames.push({ phase: 'prefix', activeLine: L('leftMax[i] = Math.max'), pythonLine: P('left_max[i] = max'), message: `Largest value left of index ${i} is ${leftMax[i]}.`, i, leftMax: [...leftMax], rightMin: [...rightMin], ok: null })
  }
  for (let i = n - 2; i >= 0; i--) {
    rightMin[i] = Math.min(rightMin[i + 1], nums[i + 1])
    frames.push({ phase: 'suffix', activeLine: L('rightMin[i] = Math.min'), pythonLine: P('right_min[i] = min'), message: `Smallest value right of index ${i} is ${rightMin[i]}.`, i, leftMax: [...leftMax], rightMin: [...rightMin], ok: null })
  }
  let count = 0
  const ok = []
  for (let i = 0; i < n; i++) {
    const good = leftMax[i] < nums[i] && nums[i] < rightMin[i]
    if (good) count++
    ok.push(good)
    frames.push({ phase: 'check', activeLine: L('leftMax[i] < nums[i]'), pythonLine: P('if left_max[i]'), message: good ? `${nums[i]} is guaranteed: everything left is smaller and everything right is larger.` : `${nums[i]} is not guaranteed.`, i, leftMax: [...leftMax], rightMin: [...rightMin], ok: [...ok], count })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), message: `${count} guaranteed value(s).`, i: -1, leftMax: [...leftMax], rightMin: [...rightMin], ok: [...ok], count, result: count })
  return { input: { nums }, result: count, frames }
}
