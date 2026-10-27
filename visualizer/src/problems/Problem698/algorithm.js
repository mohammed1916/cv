export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 500)) throw new Error('nums must be 1–16 integers from 1 to 500 (the search is shown in full).')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be from 1 to the length of nums.')
  return { nums, k }
}

export const code = `canPartitionKSubsets(nums, k):
  total = sum of nums
  if total is not divisible by k, return false
  target = total divided by k
  set the sum of each of the k buckets to 0
  sort nums from largest to smallest
  place(i):
    if i is past the last number, return true when every bucket sum equals target
    for each bucket b
      skip b if adding nums[i] would exceed target
      skip b if it is empty and an earlier empty bucket was already tried
      add nums[i] to bucket b
      if place(i + 1) succeeds, return true
      remove nums[i] from bucket b
    return false
  return place(0)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Sort descending and place each number into the first bucket that still fits, backtracking on failure.
export function buildTrace({ nums, k }) {
  const total = nums.reduce((a, b) => a + b, 0)
  const frames = [{ phase: 'start', buckets: [], sums: [], target: null, activeLine: L('total = sum of nums'), message: 'The total must split evenly into k buckets.' }]
  if (total % k !== 0) {
    frames.push({ phase: 'done', buckets: [], sums: [], target: null, result: false, activeLine: L('if total is not divisible by k'), message: `Total ${total} is not divisible by ${k}.` })
    return { input: { nums, k }, result: false, frames }
  }
  const target = total / k
  const sorted = [...nums].sort((a, b) => b - a)
  const sums = Array(k).fill(0)
  const buckets = Array.from({ length: k }, () => [])
  const pushFrame = (phase, activeLine, message) => frames.push({ phase, buckets: buckets.map(b => [...b]), sums: [...sums], target, activeLine, message })
  function place(i) {
    if (i === sorted.length) return sums.every(s => s === target)
    const seenEmpty = new Set()
    for (let b = 0; b < k; b++) {
      if (sums[b] + sorted[i] > target || seenEmpty.has(sums[b])) continue
      if (buckets[b].length === 0) seenEmpty.add(sums[b])
      buckets[b].push(sorted[i]); sums[b] += sorted[i]
      pushFrame('place', L('add nums[i] to bucket b'), `Place ${sorted[i]} in bucket ${b} (sum ${sums[b]} of ${target}).`)
      if (place(i + 1)) return true
      buckets[b].pop(); sums[b] -= sorted[i]
      pushFrame('undo', L('remove nums[i] from bucket b'), `Backtrack ${sorted[i]} from bucket ${b}.`)
    }
    return false
  }
  const result = place(0)
  frames.push({ phase: 'done', buckets: buckets.map(b => [...b]), sums: [...sums], target, result, activeLine: L('return place(0)'), message: result ? `Each bucket sums to ${target}.` : 'No assignment works.' })
  return { input: { nums, k }, result, frames }
}

export const python = `def can_partition_k_subsets(nums, k):
    total = sum(nums)
    if total % k != 0:
        return False
    target = total // k
    sums = [0] * k
    ordered = sorted(nums, reverse=True)

    def place(i):
        if i == len(ordered):
            return all(s == target for s in sums)
        tried_empty = False
        for b in range(k):
            if sums[b] + ordered[i] > target:
                continue
            if sums[b] == 0:
                if tried_empty:
                    continue
                tried_empty = True
            sums[b] += ordered[i]
            if place(i + 1):
                return True
            sums[b] -= ordered[i]
        return False

    return place(0)`
