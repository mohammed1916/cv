export const phases = [
  { id: 'start', label: 'Start', description: 'Find the total. Removing values from the ends leaves a middle block whose sum is total minus x.' },
  { id: 'window', label: 'Grow window', description: 'Extend the middle block one value to the right and add that value to its sum.' },
  { id: 'shrink', label: 'Shrink window', description: 'While the block sum is above the target, drop values from its left edge.' },
  { id: 'record', label: 'Record block', description: 'When the block sum equals the target, keep the longest block seen so far.' },
  { id: 'done', label: 'Answer', description: 'Removals equal the values outside the longest block, or -1 if no block fits.' },
]

const codeText = `min operations to reduce x (nums, x):
  target = sum(nums) - x
  if target < 0: return -1
  best = 0, left = 0, window = 0
  for right in each index:
    window = window + nums[right]
    while window > target: shrink from the left
    if window == target: best = longest block
  if best == 0 and target > 0: return -1
  return length - best`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

const pythonText = `def min_operations(nums, x):
    target = sum(nums) - x
    if target < 0:
        return -1
    best = left = window = 0
    for right, value in enumerate(nums):
        window += value
        while window > target:
            window -= nums[left]
            left += 1
        if window == target:
            best = max(best, right - left + 1)
    if best == 0 and target > 0:
        return -1
    return len(nums) - best
`

export const python = pythonText
const L = s => codeText.split('\n').findIndex(line => line.includes(s)) + 1
const P = s => pythonText.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [1, 4, 2], "x": 5}.')
  const { nums, x } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('nums is a list of 1 to 20 integers from 1 to 100.')
  if (!Number.isInteger(x) || x < 1 || x > 1000) throw new Error('x is an integer from 1 to 1000.')
  return { nums, x }
}

export function buildTrace({ nums, x }) {
  const n = nums.length
  const total = nums.reduce((sum, v) => sum + v, 0)
  const target = total - x
  const snap = extra => ({ left: null, right: null, window: 0, target, best: 0, ...extra })
  const frames = [{
    phase: 'start', activeLine: L('target = sum'), pythonLine: P('target = sum'),
    snapshot: snap({}),
    message: `Total ${total}. Removing ${x} from the ends keeps a middle block summing to ${target}.`,
  }]

  if (target < 0) {
    frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), snapshot: snap({}), message: `x is larger than the total, so no removal reaches it. Return -1.` })
    return { input: { nums, x }, result: -1, frames }
  }

  let left = 0
  let window = 0
  let best = 0
  for (let right = 0; right < n; right++) {
    window += nums[right]
    frames.push({
      phase: 'window', activeLine: L('window = window + nums'), pythonLine: P('window += value'),
      snapshot: snap({ left, right, window, best }),
      message: `Add index ${right} (${nums[right]}). Block [${left}..${right}] sums to ${window}.`,
    })
    while (window > target) {
      window -= nums[left]
      left += 1
    }
    if (left > 0 && window <= target) {
      frames.push({
        phase: 'shrink', activeLine: L('while window > target'), pythonLine: P('while window > target'),
        snapshot: snap({ left, right, window, best }),
        message: `Block sum is now ${window} after dropping from the left. The block is [${left}..${right}].`,
      })
    }
    if (window === target) {
      best = Math.max(best, right - left + 1)
      frames.push({
        phase: 'record', activeLine: L('if window == target'), pythonLine: P('if window == target'),
        snapshot: snap({ left, right, window, best }),
        message: `Block [${left}..${right}] sums to ${target}, so it can stay. Longest block is ${best} values.`,
      })
    }
  }

  const result = best === 0 && target > 0 ? -1 : n - best
  frames.push({
    phase: 'done', activeLine: L(result === -1 ? 'return -1' : 'return length'), pythonLine: P(result === -1 ? 'return -1' : 'return len'),
    snapshot: snap({ best }),
    message: result === -1
      ? 'No block of the array sums to the target, so the answer is -1.'
      : `Remove the ${result} value${result === 1 ? '' : 's'} outside the longest block of ${best}.`,
  })
  return { input: { nums, x }, result, frames }
}
