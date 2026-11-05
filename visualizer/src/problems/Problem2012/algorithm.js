export const phases = [
  { id: 'start', label: 'Prefix and suffix', description: 'Record the largest value to the left and the smallest value to the right of each index.' },
  { id: 'beauty', label: 'Score each index', description: 'Beauty 2 needs the global ordering; beauty 1 needs only the two neighbours; otherwise 0.' },
  { id: 'done', label: 'Result', description: 'Add the beauty of every interior index.' },
]

export const code = `function sumOfBeauties(nums) {
  const n = nums.length
  const prefixMax = new Array(n).fill(0)
  const suffixMin = new Array(n).fill(0)
  prefixMax[0] = nums[0]
  for (let i = 1; i < n; i++) prefixMax[i] = Math.max(prefixMax[i - 1], nums[i])
  suffixMin[n - 1] = nums[n - 1]
  for (let i = n - 2; i >= 0; i--) suffixMin[i] = Math.min(suffixMin[i + 1], nums[i])
  let total = 0
  for (let i = 1; i <= n - 2; i++) {
    if (prefixMax[i - 1] < nums[i] && nums[i] < suffixMin[i + 1]) total += 2
    else if (nums[i - 1] < nums[i] && nums[i] < nums[i + 1]) total += 1
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def sum_of_beauties(nums):
    n = len(nums)
    prefix_max = [0] * n
    suffix_min = [0] * n
    prefix_max[0] = nums[0]
    for i in range(1, n):
        prefix_max[i] = max(prefix_max[i - 1], nums[i])
    suffix_min[n - 1] = nums[n - 1]
    for i in range(n - 2, -1, -1):
        suffix_min[i] = min(suffix_min[i + 1], nums[i])
    total = 0
    for i in range(1, n - 1):
        if prefix_max[i - 1] < nums[i] < suffix_min[i + 1]:
            total += 2
        elif nums[i - 1] < nums[i] < nums[i + 1]:
            total += 1
    return total
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [1,2,3].') }
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 30) throw new Error('nums must have 3 to 30 values here.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value must be a whole number from 1 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const n = nums.length
  const prefixMax = new Array(n).fill(0)
  const suffixMin = new Array(n).fill(0)
  prefixMax[0] = nums[0]
  for (let i = 1; i < n; i++) prefixMax[i] = Math.max(prefixMax[i - 1], nums[i])
  suffixMin[n - 1] = nums[n - 1]
  for (let i = n - 2; i >= 0; i--) suffixMin[i] = Math.min(suffixMin[i + 1], nums[i])
  const add = (phase, c, p, message, index, beauty) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, prefixMax, suffixMin, index, beauty, total: 0 },
  })
  add('start', 'const prefixMax', 'prefix_max = [0]', 'Prefix maxima and suffix minima are ready.', -1, null)
  let total = 0
  for (let i = 1; i <= n - 2; i++) {
    let beauty = 0
    if (prefixMax[i - 1] < nums[i] && nums[i] < suffixMin[i + 1]) beauty = 2
    else if (nums[i - 1] < nums[i] && nums[i] < nums[i + 1]) beauty = 1
    total += beauty
    add('beauty', 'if (prefixMax[i - 1]', 'if prefix_max[i - 1]', `Index ${i} (value ${nums[i]}) has beauty ${beauty}.`, i, beauty)
  }
  add('done', 'return total', 'return total', `Sum of beauties: ${total}.`, n - 1, null)
  return { input: nums, result: total, frames }
}
