export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('k must be an integer from 1 to 6.')
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 8 || nums.length % 2 !== 0) throw new Error('nums must have an even length from 2 to 8.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > k)) throw new Error('Each value in nums must be an integer from 0 to k.')
  return { nums, k }
}

// Cost of one pair (a, b) when the common difference must be target.
function pairCost(a, b, target, k) {
  if (Math.abs(a - b) === target) return 0
  const inRange = v => v >= 0 && v <= k
  if ([b + target, b - target, a + target, a - target].some(inRange)) return 1
  return 2
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  let best = null
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), target: -1, pair: -1, total: 0, best, message: `Pair each position with its mirror. Try every common difference from 0 to ${k}.` }]
  for (let target = 0; target <= k; target++) {
    let total = 0
    for (let i = 0; i < n / 2; i++) {
      const cost = pairCost(nums[i], nums[n - 1 - i], target, k)
      total += cost
      frames.push({ phase: 'pair', activeLine: L('add the cost of this pair'), target, pair: i, total, best, message: `Pair (${nums[i]}, ${nums[n - 1 - i]}) with difference ${target} costs ${cost}.` })
    }
    if (best === null || total < best) best = total
    frames.push({ phase: 'target', activeLine: L('if best is nothing'), target, pair: -1, total, best, message: `Difference ${target} needs ${total} changes. Best so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), target: -1, pair: -1, total: best, best, message: `Minimum number of changes: ${best}.` })
  return { input, result: best, frames }
}

export const code = `minimum changes to make pair differences equal (nums, k):
  set best to nothing
  for each target difference from 0 to k:
    set total to 0
    for each pair (a, b) of mirrored positions i and n - 1 - i:
      add the cost of this pair for the target to total
    if best is nothing or total is less than best then
      set best to total
  return best

cost of a pair (a, b) for a target:
  if the gap |a - b| equals the target then the cost is 0
  otherwise if changing one of a or b to a value from 0 to k gives the target then the cost is 1
  otherwise the cost is 2`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_array_changes(nums, k):
    n = len(nums)
    best = None
    for target in range(k + 1):
        total = 0
        for i in range(n // 2):
            a = nums[i]
            b = nums[n - 1 - i]
            if abs(a - b) == target:
                cost = 0
            elif any(0 <= v <= k for v in (b + target, b - target, a + target, a - target)):
                cost = 1
            else:
                cost = 2
            total += cost
        if best is None or total < best:
            best = total
    return best
`
