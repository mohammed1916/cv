export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 500)) throw new Error('nums must be 1–16 integers from 1 to 500 (the search is shown in full).')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be from 1 to the length of nums.')
  return { nums, k }
}

// Sort descending and place each number into the first bucket that still fits, backtracking on failure.
export function buildTrace({ nums, k }) {
  const total = nums.reduce((a, b) => a + b, 0)
  const frames = [{ phase: 'start', buckets: [], sums: [], target: null, activeLine: 2, message: 'The total must split evenly into k buckets.' }]
  if (total % k !== 0) {
    frames.push({ phase: 'done', buckets: [], sums: [], target: null, result: false, activeLine: 9, message: `Total ${total} is not divisible by ${k}.` })
    return { input: { nums, k }, result: false, frames }
  }
  const target = total / k
  const sorted = [...nums].sort((a, b) => b - a)
  const sums = Array(k).fill(0)
  const buckets = Array.from({ length: k }, () => [])
  const pushFrame = (phase, message) => frames.push({ phase, buckets: buckets.map(b => [...b]), sums: [...sums], target, activeLine: phase === 'place' ? 6 : 8, message })
  function place(i) {
    if (i === sorted.length) return sums.every(s => s === target)
    const seenEmpty = new Set()
    for (let b = 0; b < k; b++) {
      if (sums[b] + sorted[i] > target || seenEmpty.has(sums[b])) continue
      if (buckets[b].length === 0) seenEmpty.add(sums[b])
      buckets[b].push(sorted[i]); sums[b] += sorted[i]
      pushFrame('place', `Place ${sorted[i]} in bucket ${b} (sum ${sums[b]} of ${target}).`)
      if (place(i + 1)) return true
      buckets[b].pop(); sums[b] -= sorted[i]
      pushFrame('undo', `Backtrack ${sorted[i]} from bucket ${b}.`)
    }
    return false
  }
  const result = place(0)
  frames.push({ phase: 'done', buckets: buckets.map(b => [...b]), sums: [...sums], target, result, activeLine: 10, message: result ? `Each bucket sums to ${target}.` : 'No assignment works.' })
  return { input: { nums, k }, result, frames }
}

export const code = `def canPartitionKSubsets(nums, k):
    total = sum(nums)
    if total % k: return False
    target, sums = total // k, [0] * k
    def place(i):
        if i == len(nums): return all(s == target for s in sums)
        for b in range(k):
            if sums[b] + nums[i] <= target:
                sums[b] += nums[i]
                if place(i + 1): return True
                sums[b] -= nums[i]
        return False
    return place(0)`.split('\n').map((text, index) => ({ line: index + 1, text }))
