export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 numbers for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 500)) throw new Error('Each number must be an integer from 1 to 500.')
  return { nums }
}

// True when adding x would create a triple with distinct indices where one value is the sum of two others.
// The window counts are checked directly, so the duplicate case needs at least two copies.
function createsTriple(counts, x) {
  for (const [a, ca] of counts) {
    const b = x - a
    if (counts.has(b) && (b !== a || ca >= 2)) return true
    const c = x + a
    if (counts.has(c) && (c !== a || ca >= 2)) return true
  }
  return false
}

export function buildTrace(input) {
  const { nums } = input
  const counts = new Map()
  const frames = []
  let left = 0
  let best = 0
  const remove = v => {
    const c = counts.get(v) - 1
    if (c === 0) counts.delete(v)
    else counts.set(v, c)
  }
  nums.forEach((x, right) => {
    while (left < right && createsTriple(counts, x)) {
      frames.push({ phase: 'shrink', activeLine: L('remove nums[left]'), left, right, best, message: `${x} would complete a triple, so drop ${nums[left]} from the left.` })
      remove(nums[left])
      left++
    }
    counts.set(x, (counts.get(x) ?? 0) + 1)
    best = Math.max(best, right - left + 1)
    frames.push({ phase: 'extend', activeLine: L('add nums[right]'), left, right, best, message: `Window [${left}..${right}] is valid; best is ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), left, right: nums.length - 1, best, message: `Longest valid subarray: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest subarray with restricted pair sums(nums)
  set best to 0 and left to 0
  set counts to an empty map of values in the window
  for each index right in nums do
    while left is before right and adding nums[right] creates a triple do
      remove nums[left] from counts and add 1 to left
    add nums[right] to counts
    set best to the larger of best and right minus left plus 1
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_restricted_pair_subarray(nums):
    def creates_triple(counts, x):
        for a, ca in counts.items():
            b = x - a
            if b in counts and (b != a or ca >= 2):
                return True
            c = x + a
            if c in counts and (c != a or ca >= 2):
                return True
        return False

    counts = {}
    left = 0
    best = 0
    for right, x in enumerate(nums):
        while left < right and creates_triple(counts, x):
            v = nums[left]
            counts[v] -= 1
            if counts[v] == 0:
                del counts[v]
            left += 1
        counts[x] = counts.get(x, 0) + 1
        best = max(best, right - left + 1)
    return best
`
