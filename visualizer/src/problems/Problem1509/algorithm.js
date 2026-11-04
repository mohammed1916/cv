export const phases = [
  { id: 'setup', label: 'Set up', description: 'Read the values. With four or fewer, three changes can make every value equal.' },
  { id: 'sort', label: 'Sort', description: 'Sorting puts the candidates for the smallest and largest values next to each other.' },
  { id: 'window', label: 'Try a window', description: 'Three changes replace the smallest and largest values. Each split of left and right removals leaves one contiguous window.' },
  { id: 'best', label: 'Keep the best', description: 'Keep the narrowest window found so far.' },
  { id: 'done', label: 'Complete', description: 'Return the smallest range after at most three changes.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Enter a JSON array of 1 to 20 integers from -1000 to 1000.')
  return nums
}

export const code = [
  "function minDifferenceAfterThreeMoves(nums) {",
  "  if (nums.length <= 4) return 0",
  "  const sorted = [...nums].sort((a, b) => a - b)",
  "  let best = Infinity",
  "  for (let left = 0; left <= 3; left++) {",
  "    const right = sorted.length - 4 + left",
  "    best = Math.min(best, sorted[right] - sorted[left])",
  "  }",
  "  return best }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def min_difference(nums):
    if len(nums) <= 4:
        return 0
    nums.sort()
    n = len(nums)
    best = float('inf')
    for left in range(4):
        right = n - 4 + left
        best = min(best, nums[right] - nums[left])
    return best
`

const SPOT = {
  setup: ["if (nums.length <= 4)", "if len(nums) <= 4"],
  short: ["return 0", "return 0"],
  sort: [".sort((a, b) => a - b)", "nums.sort()"],
  window: ["const right = sorted.length - 4 + left", "right = n - 4 + left"],
  best: ["best = Math.min(", "best = min("],
  done: ["return best", "return best"],
}
function where(key) {
  const [pseudo, py] = SPOT[key]
  return {
    activeLine: code.findIndex(c => c.text.includes(pseudo)) + 1,
    pythonLine: python.split('\n').findIndex(l => l.includes(py)) + 1,
  }
}

export function buildTrace(nums) {
  const n = nums.length
  const frames = []
  const emit = (phase, key, message, snapshot) => frames.push({ phase, ...where(key), message, snapshot })

  emit('setup', 'setup', `${n} value${n === 1 ? '' : 's'} read. ${n <= 4 ? 'With four or fewer values, three changes can make all of them equal.' : 'Three changes can remove the three most extreme values from either end, in any split.'}`, { sorted: null, left: null, right: null, best: null })
  if (n <= 4) {
    emit('done', 'short', 'Length is at most four, so the answer is 0.', { sorted: [...nums].sort((a, b) => a - b), left: null, right: null, best: 0 })
    return { input: nums, result: 0, frames }
  }
  const sorted = [...nums].sort((a, b) => a - b)
  emit('sort', 'sort', `Sorted: ${sorted.join(', ')}.`, { sorted, left: null, right: null, best: null })
  let best = Infinity
  for (let left = 0; left < 4; left++) {
    const right = n - 4 + left
    const width = sorted[right] - sorted[left]
    emit('window', 'window', `Change the ${left} smallest and ${3 - left} largest values. The kept window runs from ${sorted[left]} to ${sorted[right]}, width ${width}.`, { sorted, left, right, best, width })
    if (width < best) {
      best = width
      emit('best', 'best', `Width ${width} is the narrowest so far.`, { sorted, left, right, best, width })
    }
  }
  emit('done', 'done', `Smallest achievable range after at most three changes: ${best}.`, { sorted, left: null, right: null, best })
  return { input: nums, result: best, frames }
}
