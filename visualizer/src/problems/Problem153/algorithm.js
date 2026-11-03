export const phases = [
  { id: 'start', label: 'Search window', description: 'The window covers the whole array. The minimum lies somewhere inside it.' },
  { id: 'probe', label: 'Probe middle', description: 'Compare the middle value with the rightmost value to see which half holds the rotation point.' },
  { id: 'right', label: 'Go right', description: 'The middle is larger than the right end, so the drop, and the minimum, lie strictly to its right.' },
  { id: 'left', label: 'Keep left', description: 'The middle is not larger than the right end, so the middle may itself be the minimum and stays in the window.' },
  { id: 'done', label: 'Minimum', description: 'The window has one position left, which holds the minimum.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) {
    throw new Error('Enter a JSON array of 1 to 12 integers from -100 to 100.')
  }
  if (new Set(nums).size !== nums.length) throw new Error('All values must be distinct.')
  const descents = nums.filter((v, i) => v > nums[(i + 1) % nums.length]).length
  if (descents > 1) throw new Error('The array must be a sorted list rotated to the right.')
  return nums
}

export const code = `find minimum (nums):
  lo = 0, hi = n - 1
  while lo < hi:
    mid = (lo + hi) // 2
    if nums[mid] > nums[hi]:
      lo = mid + 1
    else:
      hi = mid
  return nums[lo]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

export function buildTrace(nums) {
  const frames = []
  let lo = 0
  let hi = nums.length - 1
  const snap = (mid, extra = {}) => ({ nums, lo, hi, mid, ...extra })
  frames.push({ phase: 'start', ...at('lo = 0', 'lo, hi = 0'), message: `The window is positions ${lo} to ${hi}. Shrink it until one position is left.`, snapshot: snap(null) })
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    frames.push({ phase: 'probe', ...at('mid = (lo + hi)', 'mid = (lo + hi)'), message: `Middle is position ${mid} with value ${nums[mid]}. The right end is ${nums[hi]} at position ${hi}.`, snapshot: snap(mid, { compared: [nums[mid], nums[hi]] }) })
    if (nums[mid] > nums[hi]) {
      lo = mid + 1
      frames.push({ phase: 'right', ...at('lo = mid + 1', 'lo = mid + 1'), message: `${nums[mid]} > ${nums[hi]}: the drop lies to the right, so the window becomes ${lo} to ${hi}.`, snapshot: snap(mid, { compared: [nums[mid], nums[hi]] }) })
    } else {
      hi = mid
      frames.push({ phase: 'left', ...at('hi = mid', 'hi = mid'), message: `${nums[mid]} <= ${nums[hi]}: the minimum is at or left of position ${mid}, so the window becomes ${lo} to ${hi}.`, snapshot: snap(mid, { compared: [nums[mid], nums[hi]] }) })
    }
  }
  frames.push({ phase: 'done', ...at('return nums[lo]', 'return nums[lo]'), message: `Position ${lo} holds ${nums[lo]}, the minimum.`, snapshot: snap(null) })
  return { input: nums, result: nums[lo], frames }
}
