export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use a JSON object with a nums array.')
  if (input.nums.length < 1 || input.nums.length > 30) throw new Error('nums needs 1 to 30 values (visualization cap).')
  if (input.nums.some(v => !Number.isInteger(v) || v < -20 || v > 20)) throw new Error('nums values are integers from -20 to 20.')
  return input
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('count = 0'), span: null, centered: null, count, message: 'Try every subarray, growing it to the right from each start.' }]
  for (let l = 0; l < n; l++) {
    let total = 0
    const seen = new Set()
    for (let r = l; r < n; r++) {
      total += nums[r]
      seen.add(nums[r])
      const centered = seen.has(total)
      if (centered) count++
      frames.push({ phase: 'extend', activeLine: L('if total is in seen'), span: [l, r], centered, count, message: `Subarray [${l}, ${r}] sums to ${total}. ${centered ? 'The sum appears inside it, so it is centered.' : 'The sum does not appear inside it.'}` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), span: null, centered: null, count, message: `${count} centered subarray(s).` })
  return { input, result: count, frames }
}

export const code = `count centered subarrays (nums):
  count = 0
  for each start index l
    total = 0 and seen = empty set
    for each end index r from l
      add nums[r] to total and to seen
      if total is in seen then add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_centered_subarrays(nums):
    count = 0
    n = len(nums)
    for l in range(n):
        total = 0
        seen = set()
        for r in range(l, n):
            total += nums[r]
            seen.add(nums[r])
            if total in seen:
                count += 1
    return count
`
