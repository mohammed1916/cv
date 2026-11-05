// LeetCode 2210: Count Hills and Valleys in an Array.
// Runs of equal neighbours count as one position. Compress the array so no two neighbours are equal, then an index
// is a hill when both of its neighbours are smaller, and a valley when both are larger. Count those interior indices.

const MAX_LEN = 14
const MAX_VALUE = 9

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers, e.g. [2,4,1,1,6,5].') }
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > MAX_LEN) throw new Error(`Use 3 to ${MAX_LEN} values. The visualization caps the length there.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 0 to ${MAX_VALUE}.`)
  return { nums }
}

export const code = `FUNCTION countHillValley(nums)
    compact ← nums with consecutive duplicates removed
    count ← 0
    FOR i from 1 to length(compact) - 2
        left ← compact[i - 1], mid ← compact[i], right ← compact[i + 1]
        IF (mid > left AND mid > right) OR (mid < left AND mid < right) THEN
            count ← count + 1
    RETURN count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_hill_valley(nums):
    compact = [v for i, v in enumerate(nums) if i == 0 or v != nums[i - 1]]
    count = 0
    for i in range(1, len(compact) - 1):
        left, mid, right = compact[i - 1], compact[i], compact[i + 1]
        if (mid > left and mid > right) or (mid < left and mid < right):
            count += 1
    return count
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'compact', label: 'Compact', description: 'Merge runs of equal values into one position.' },
  { id: 'check', label: 'Check', description: 'Each interior position is compared with its two neighbours.' },
  { id: 'done', label: 'Result', description: 'The number of hills and valleys.' },
]

export function buildTrace({ nums }) {
  const compact = nums.filter((v, i) => i === 0 || v !== nums[i - 1])
  const origin = nums.map((v, i) => i).filter(i => i === 0 || nums[i] !== nums[i - 1])
  const frames = []
  let count = 0
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, nums, compact, count, ...extra })
  push('compact', -1, L('compact ← nums'), P('compact = [v'), `Runs collapse: ${nums.join(', ')} becomes ${compact.join(', ')}.`)
  for (let i = 1; i < compact.length - 1; i++) {
    const [left, mid, right] = [compact[i - 1], compact[i], compact[i + 1]]
    const hill = mid > left && mid > right
    const valley = mid < left && mid < right
    if (hill || valley) count += 1
    push('check', i, L('IF (mid > left'), P('if (mid > left'),
      `${left}, ${mid}, ${right}: ${hill ? 'a hill' : valley ? 'a valley' : 'neither a hill nor a valley'}. Count ${count}.`, { hill, valley, triple: [left, mid, right], midAt: origin[i] })
  }
  push('done', -1, L('RETURN count'), P('return count'), `${count} hill(s) and valley(s).`, { result: count })
  return { input: { nums }, result: count, frames }
}
