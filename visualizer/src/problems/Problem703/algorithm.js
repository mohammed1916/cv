export function parseInput(text) {
  const data = JSON.parse(text)
  const { k, nums, adds } = data ?? {}
  if (!Number.isInteger(k) || k < 1 || k > 200) throw new Error('k must be an integer from 1 to 200.')
  if (!Array.isArray(nums) || nums.length > 200 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('nums must be up to 200 integers with |v| ≤ 10,000.')
  if (nums.length < k - 1) throw new Error('nums must hold at least k − 1 values so every answer exists.')
  if (!Array.isArray(adds) || adds.length < 1 || adds.length > 200 || adds.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('adds must be 1–200 integers with |v| ≤ 10,000.')
  return { k, nums, adds }
}

// Keep only the k largest values seen so far, sorted ascending; the kth largest is the smallest kept value.
export function buildTrace({ k, nums, adds }) {
  let top = []
  const offer = v => {
    if (top.length < k) { top = [...top, v].sort((a, b) => a - b); return }
    if (v > top[0]) top = [...top.slice(1), v].sort((a, b) => a - b)
  }
  nums.forEach(offer)
  const frames = [{ phase: 'start', top: [...top], op: null, activeLine: 2, message: `Keep the ${k} largest values from [${nums.join(', ')}].` }]
  const results = []
  adds.forEach((v, i) => {
    const before = top.length
    offer(v)
    results.push(top[0])
    frames.push({ phase: 'add', top: [...top], op: i, value: v, kept: v > (before === k ? top[0] : -Infinity) || top.length > before, result: top[0], activeLine: 6, message: `add(${v}): kth largest is ${top[0]}.` })
  })
  frames.push({ phase: 'done', top: [...top], op: adds.length - 1, result: results, activeLine: 9, message: `Results: [${results.join(', ')}].` })
  return { input: { k, nums, adds }, result: results, frames }
}

export const code = `class KthLargest:
    def __init__(self, k, nums):
        self.k, self.top = k, []
        for v in nums: self.add(v)
    def add(self, val):
        if len(self.top) < self.k: self.top.append(val)
        elif val > self.top[0]: self.top[0] = val
        self.top.sort()
        return self.top[0]`.split('\n').map((text, index) => ({ line: index + 1, text }))
