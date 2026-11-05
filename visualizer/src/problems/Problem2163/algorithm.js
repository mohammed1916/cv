// LeetCode 2163: Minimum Difference in Sums After Removal of Elements.
// Remove n elements so that the remaining 2n split into a first n and a second n.
// For a split after index k (n <= k <= 2n): the first part should have the smallest possible sum among
// nums[0..k-1], and the second part the largest possible sum among nums[k..3n-1]. Heaps track both sides
// while sliding the split point.

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array whose length is 3n, e.g. [3,1,2,4,5,6].') }
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 18 || nums.length % 3 !== 0 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 100000)) {
    throw new Error('Use 3, 6, 9, 12, 15 or 18 integers (length a multiple of 3), each up to 100000 in absolute value.')
  }
  return { nums }
}

export const code = `class Heap {
  constructor(sign) {
    this.sign = sign
    this.items = []
  }
  push(value) {
    const v = this.sign * value
    this.items.push(v)
    let i = this.items.length - 1
    while (i > 0 && this.items[(i - 1) >> 1] > this.items[i]) {
      ;[this.items[(i - 1) >> 1], this.items[i]] = [this.items[i], this.items[(i - 1) >> 1]]
      i = (i - 1) >> 1
    }
  }
  pop() {
    const top = this.items[0]
    const last = this.items.pop()
    if (this.items.length) {
      this.items[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let s = i
        if (l < this.items.length && this.items[l] < this.items[s]) s = l
        if (r < this.items.length && this.items[r] < this.items[s]) s = r
        if (s === i) break
        ;[this.items[s], this.items[i]] = [this.items[i], this.items[s]]
        i = s
      }
    }
    return this.sign * top
  }
}

function minimumDifference(nums) {
  const n = nums.length / 3
  const prefixMin = new Array(nums.length + 1).fill(0)
  const low = new Heap(-1)
  let sum = 0
  for (let i = 0; i < n; i++) { low.push(nums[i]); sum += nums[i] }
  prefixMin[n] = sum
  for (let i = n; i < 2 * n; i++) {
    low.push(nums[i])
    sum += nums[i]
    sum -= low.pop()
    prefixMin[i + 1] = sum
  }
  const suffixMax = new Array(nums.length + 1).fill(0)
  const high = new Heap(1)
  sum = 0
  for (let i = nums.length - 1; i >= 2 * n; i--) { high.push(nums[i]); sum += nums[i] }
  suffixMax[2 * n] = sum
  for (let i = 2 * n - 1; i >= n; i--) {
    high.push(nums[i])
    sum += nums[i]
    sum -= high.pop()
    suffixMax[i] = sum
  }
  let best = Infinity
  for (let k = n; k <= 2 * n; k++) best = Math.min(best, prefixMin[k] - suffixMax[k])
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: minimum_difference
import heapq

def minimum_difference(nums):
    n = len(nums) // 3
    prefix_min = [0] * (len(nums) + 1)
    low = []
    total = 0
    for i in range(n):
        heapq.heappush(low, -nums[i])
        total += nums[i]
    prefix_min[n] = total
    for i in range(n, 2 * n):
        heapq.heappush(low, -nums[i])
        total += nums[i]
        total += heapq.heappop(low)
        prefix_min[i + 1] = total
    suffix_max = [0] * (len(nums) + 1)
    high = []
    total = 0
    for i in range(len(nums) - 1, 2 * n - 1, -1):
        heapq.heappush(high, nums[i])
        total += nums[i]
    suffix_max[2 * n] = total
    for i in range(2 * n - 1, n - 1, -1):
        heapq.heappush(high, nums[i])
        total += nums[i]
        total -= heapq.heappop(high)
        suffix_max[i] = total
    return min(prefix_min[k] - suffix_max[k] for k in range(n, 2 * n + 1))
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'prefix', label: 'Left heap', description: 'Keep the n smallest values seen so far on the left.' },
  { id: 'suffix', label: 'Right heap', description: 'Keep the n largest values seen so far on the right.' },
  { id: 'split', label: 'Split', description: 'For each split point, the difference is left minimum minus right maximum.' },
  { id: 'done', label: 'Result', description: 'The smallest difference over all split points.' },
]

// Heap helpers used for the trace: the same sums as the code, with snapshots for display.
function trace(nums) {
  const frames = []
  const n = nums.length / 3
  const prefixMin = new Array(nums.length + 1).fill(0)
  const suffixMax = new Array(nums.length + 1).fill(0)
  const low = []
  const high = []
  const pushLow = v => { low.push(v); low.sort((a, b) => b - a) }
  const popLow = () => low.shift()
  const pushHigh = v => { high.push(v); high.sort((a, b) => a - b) }
  const popHigh = () => high.shift()
  let sum = 0
  for (let i = 0; i < n; i++) { pushLow(nums[i]); sum += nums[i] }
  prefixMin[n] = sum
  frames.push({ phase: 'prefix', activeLine: L('const low = new Heap'), pythonLine: P('low = []'), message: `First ${n} values form the left part, sum ${sum}.`, heap: [...low].sort((a, b) => b - a), k: n, split: null, prefixMin, suffixMax })
  for (let i = n; i < 2 * n; i++) {
    pushLow(nums[i]); sum += nums[i]
    const removed = popLow(); sum -= removed
    prefixMin[i + 1] = sum
    frames.push({ phase: 'prefix', activeLine: L('sum -= low.pop()'), pythonLine: P('total += heapq.heappop'), message: `Add ${nums[i]}, drop largest ${removed}: best left sum for ${i + 1} values is ${sum}.`, heap: [...low].sort((a, b) => b - a), k: i + 1, split: null, prefixMin, suffixMax })
  }
  sum = 0
  for (let i = nums.length - 1; i >= 2 * n; i--) { pushHigh(nums[i]); sum += nums[i] }
  suffixMax[2 * n] = sum
  for (let i = 2 * n - 1; i >= n; i--) {
    pushHigh(nums[i]); sum += nums[i]
    const removed = popHigh(); sum -= removed
    suffixMax[i] = sum
    frames.push({ phase: 'suffix', activeLine: L('sum -= high.pop()'), pythonLine: P('total -= heapq.heappop'), message: `Add ${nums[i]} from the right, drop smallest ${removed}: best right sum from ${i} is ${sum}.`, heap: [...high].sort((a, b) => a - b), k: i, split: null, prefixMin, suffixMax })
  }
  let best = Infinity
  for (let k = n; k <= 2 * n; k++) {
    best = Math.min(best, prefixMin[k] - suffixMax[k])
    frames.push({ phase: 'split', activeLine: L('for (let k = n'), pythonLine: P('for k in range(n'), message: `Split after ${k}: ${prefixMin[k]} minus ${suffixMax[k]} = ${prefixMin[k] - suffixMax[k]}; best ${best}.`, heap: [], k, split: k, prefixMin, suffixMax })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return min('), message: `Minimum difference: ${best}.`, heap: [], k: null, split: null, prefixMin, suffixMax })
  return { result: best, frames }
}

export function buildTrace({ nums }) {
  const { result, frames } = trace(nums)
  return { input: { nums }, result, frames }
}
