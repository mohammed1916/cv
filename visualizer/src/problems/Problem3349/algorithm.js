export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with a "nums" array and a "k".')
  const { nums, k } = input
  if (nums.length < 2 || nums.length > 40) throw new Error('nums holds 2 to 40 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < -50 || v > 50)) throw new Error('Each number is an integer from -50 to 50.')
  if (!Number.isInteger(k) || k < 1 || 2 * k > nums.length) throw new Error('k must be an integer with 1 <= k and 2k <= nums.length.')
  return { nums, k }
}

// True when nums[from] through nums[from + k - 1] strictly increase.
function strictlyIncreasing(nums, from, k) {
  for (let i = from; i < from + k - 1; i++) if (nums[i] >= nums[i + 1]) return false
  return true
}

export function buildTrace(input) {
  const { nums, k } = input
  const frames = [{ phase: 'start', activeLine: L('for each start index'), start: -1, first: null, second: null, found: false, message: `Look for two neighboring runs of length ${k} that both strictly increase.` }]
  let found = false
  for (let start = 0; start + 2 * k <= nums.length && !found; start++) {
    const first = strictlyIncreasing(nums, start, k)
    const second = strictlyIncreasing(nums, start + k, k)
    found = first && second
    frames.push({ phase: 'check', activeLine: L('if both checks pass'), start, first, second, found, message: `Run at ${start} increases: ${first}. Run at ${start + k} increases: ${second}.` })
  }
  frames.push({ phase: 'done', activeLine: L(found ? 'return true' : 'return false'), start: -1, first: null, second: null, found, message: found ? 'Two adjacent increasing runs exist.' : 'No pair of adjacent increasing runs exists.' })
  return { input, result: found, frames }
}

export const code = `adjacent strictly increasing subarrays of length k
  for each start index a from zero to the length minus 2k
    check that nums from a through a plus k minus 1 strictly increases
    check that nums from a plus k through a plus 2k minus 1 strictly increases
    if both checks pass then return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def has_adjacent_increasing(nums, k):
    for a in range(len(nums) - 2 * k + 1):
        first = all(nums[i] < nums[i + 1] for i in range(a, a + k - 1))
        second = all(nums[i] < nums[i + 1] for i in range(a + k, a + 2 * k - 1))
        if first and second:
            return True
    return False
`
