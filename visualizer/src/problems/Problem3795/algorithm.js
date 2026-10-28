export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || !Number.isInteger(input.k)) throw new Error('Use a JSON object with a nums array and an integer k.')
  if (input.nums.length < 1 || input.nums.length > 30) throw new Error('nums needs 1 to 30 values.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('nums values are integers from 1 to 20.')
  if (input.k < 1 || input.k > 60) throw new Error('k must be an integer from 1 to 60 (visualization cap).')
  return input
}

export function buildTrace(input) {
  const { nums, k } = input
  const counts = new Map()
  let total = 0
  let left = 0
  let best = null
  const frames = []
  for (let r = 0; r < nums.length; r++) {
    const x = nums[r]
    counts.set(x, (counts.get(x) || 0) + 1)
    if (counts.get(x) === 1) total += x
    frames.push({ phase: 'expand', activeLine: L('add nums[r] to counts'), left, right: r, total, best, message: `Add ${x} at index ${r}. Distinct sum: ${total}.` })
    while (total >= k) {
      const length = r - left + 1
      if (best === null || length < best) best = length
      frames.push({ phase: 'shrink', activeLine: L('set best to r - left + 1'), left, right: r, total, best, message: `Window [${left}, ${r}] has distinct sum ${total}, which is at least ${k}. Best length: ${best}.` })
      const y = nums[left]
      counts.set(y, counts.get(y) - 1)
      if (counts.get(y) === 0) total -= y
      left++
    }
  }
  const result = best === null ? -1 : best
  frames.push({ phase: 'done', activeLine: best === null ? L('return -1') : L('return best'), left, right: -1, total, best: result, message: result === -1 ? 'No subarray reaches the target.' : `Minimum length: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum subarray length with distinct sum (nums, k):
  best = nothing
  left = 0, distinct sum = 0, counts = empty map
  for each right index r
    add nums[r] to counts
    if nums[r] is new to the window then add nums[r] to the distinct sum
    while the distinct sum is at least k
      set best to r - left + 1 when that is smaller than best
      remove nums[left] from counts
      if no copy of nums[left] remains then subtract nums[left] from the distinct sum
      add 1 to left
  if best is unset then return -1
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_subarray_length_with_distinct_sum_at_least_k(nums, k):
    counts = {}
    total = 0
    left = 0
    best = None
    for r, x in enumerate(nums):
        counts[x] = counts.get(x, 0) + 1
        if counts[x] == 1:
            total += x
        while total >= k:
            length = r - left + 1
            if best is None or length < best:
                best = length
            y = nums[left]
            counts[y] -= 1
            if counts[y] == 0:
                total -= y
            left += 1
    return -1 if best is None else best
`
