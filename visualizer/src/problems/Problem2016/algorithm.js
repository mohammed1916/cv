export const phases = [
  { id: 'start', label: 'Start', description: 'Start with the first value as the smallest value seen so far; no difference exists yet.' },
  { id: 'scan', label: 'Compare with minimum', description: 'If the current value is larger than the smallest earlier value, their difference is a candidate.' },
  { id: 'update', label: 'Update minimum', description: 'Keep the smaller of the current value and the smallest earlier value for the next step.' },
  { id: 'done', label: 'Result', description: 'Return the best difference, or -1 when the array never increases.' },
]

export const code = `function maximumDifference(nums) {
  let best = -1
  let minValue = nums[0]
  for (let j = 1; j < nums.length; j++) {
    if (nums[j] > minValue) best = Math.max(best, nums[j] - minValue)
    minValue = Math.min(minValue, nums[j])
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_difference(nums):
    best = -1
    min_value = nums[0]
    for j in range(1, len(nums)):
        if nums[j] > min_value:
            best = max(best, nums[j] - min_value)
        min_value = min(min_value, nums[j])
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [7,1,5,4].') }
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 60) throw new Error('nums must have 2 to 60 values here.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each value must be a whole number from 1 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let best = -1
  let minValue = nums[0]
  let minIndex = 0
  const add = (phase, c, p, message, j) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, l: minIndex, r: j, minValue, best },
  })
  add('start', 'let best = -1', 'best = -1', `Smallest value so far is ${minValue} at index 0.`, 0)
  for (let j = 1; j < nums.length; j++) {
    if (nums[j] > minValue) {
      best = Math.max(best, nums[j] - minValue)
      add('scan', 'if (nums[j] > minValue)', 'if nums[j] > min_value', `${nums[j]} exceeds ${minValue} from index ${minIndex}; difference ${nums[j] - minValue}, best ${best}.`, j)
    } else {
      add('scan', 'if (nums[j] > minValue)', 'if nums[j] > min_value', `${nums[j]} does not exceed the smallest earlier value ${minValue}.`, j)
    }
    if (nums[j] < minValue) { minValue = nums[j]; minIndex = j }
    add('update', 'minValue = Math.min', 'min_value = min', `Smallest value so far is ${minValue} at index ${minIndex}.`, j)
  }
  add('done', 'return best', 'return best', `Maximum difference: ${best}.`, nums.length - 1)
  return { input: nums, result: best, frames }
}
