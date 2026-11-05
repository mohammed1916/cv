export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8 || !nums.every(x => Number.isInteger(x) && x >= 1 && x <= 9)) throw new Error('nums has 1 to 8 integers from 1 to 9.')
  if (!Number.isInteger(k) || k < 0 || k > 20) throw new Error('k is an integer from 0 to 20.')
  return { nums, k }
}

// Fewest increments to make a run non-decreasing: raise each element to the running maximum.
export function raiseCost(values) {
  let high = -Infinity
  let cost = 0
  for (const v of values) {
    if (v < high) cost += high - v
    else high = v
  }
  return cost
}

export function buildTrace({ nums, k }) {
  const frames = []
  let count = 0
  frames.push({ pythonLine: P('count = 0'), phase: 'start', activeLine: L('let count = 0'), at: -1, count, cost: null, message: `Budget k = ${k}. Check every subarray.` })
  for (let l = 0; l < nums.length; l++) {
    for (let r = l; r < nums.length; r++) {
      const cost = raiseCost(nums.slice(l, r + 1))
      const ok = cost <= k
      if (ok) count++
      frames.push({ pythonLine: P('if cost <= k'), phase: ok ? 'fits' : 'too-costly', activeLine: L('if (cost <= k)'), at: l, end: r, cost, count, message: `nums[${l}..${r}] needs ${cost} increment(s): ${ok ? 'counts' : 'too many'}.` })
    }
  }
  frames.push({ pythonLine: P('return count'), phase: 'done', activeLine: L('return count'), at: -1, end: -1, cost: null, count, result: count, message: `${count} subarray(s) reach a sorted run within k increments.` })
  return { input: { nums, k }, result: count, frames }
}

export const code = `function countNonDecreasing(nums, k) {
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    for (let r = l; r < nums.length; r++) {
      let high = -Infinity
      let cost = 0
      for (let i = l; i <= r; i++) {
        if (nums[i] < high) cost += high - nums[i]
        else high = nums[i]
      }
      if (cost <= k) count += 1
    }
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_subarrays(nums, k):
    count = 0
    for l in range(len(nums)):
        for r in range(l, len(nums)):
            high, cost = float('-inf'), 0
            for v in nums[l:r + 1]:
                if v < high:
                    cost += high - v
                else:
                    high = v
            if cost <= k:
                count += 1
    return count`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
