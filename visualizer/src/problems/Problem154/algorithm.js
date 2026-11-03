export const phases = [
  { id: 'start', label: 'Start', description: 'The window is the whole array. The minimum is the first value after the rotation break.' },
  { id: 'greater', label: 'Right half is lower', description: 'nums[mid] > nums[hi] means the break lies to the right of mid.' },
  { id: 'less', label: 'Left part is ordered', description: 'nums[mid] < nums[hi] means the suffix from mid is sorted, so mid may be the minimum.' },
  { id: 'equal', label: 'Equal boundary', description: 'Equal values hide the break, so shrink hi by one.' },
  { id: 'done', label: 'Complete', description: 'lo is the minimum.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 60) throw new Error('Use a JSON array of 1 to 60 integers.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('Values are integers from -100 to 100.')
  const descents = nums.slice(1).reduce((count, v, i) => count + (nums[i] > v ? 1 : 0), 0)
  if (descents > 1 || (descents === 1 && nums[nums.length - 1] > nums[0])) throw new Error('The array must be sorted and then rotated.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let lo = 0
  let hi = nums.length - 1
  const snap = (mid, extra = {}) => ({ lo, hi, mid, ...extra })
  frames.push({ phase: 'start', activeLine: L('lo, hi = 0'), pythonLine: P('lo, hi = 0'), snapshot: snap(null), message: 'Compare the middle value with the right end. Equal values need one-step shrinking.' })
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (nums[mid] > nums[hi]) {
      frames.push({ phase: 'greater', activeLine: L('nums[mid] > nums[hi]'), pythonLine: P('nums[mid] > nums[hi]'), snapshot: snap(mid), message: `${nums[mid]} > ${nums[hi]}: the minimum is right of mid.` })
      lo = mid + 1
    } else if (nums[mid] < nums[hi]) {
      frames.push({ phase: 'less', activeLine: L('nums[mid] < nums[hi]'), pythonLine: P('nums[mid] < nums[hi]'), snapshot: snap(mid), message: `${nums[mid]} < ${nums[hi]}: mid is at least as small as the right side, so keep it.` })
      hi = mid
    } else {
      frames.push({ phase: 'equal', activeLine: L('hi -= 1'), pythonLine: P('hi -= 1'), snapshot: snap(mid), message: `${nums[mid]} = ${nums[hi]}: the break might hide here, so drop index ${hi}.` })
      hi -= 1
    }
  }
  const result = nums[lo]
  frames.push({ phase: 'done', activeLine: L('return nums[lo]'), pythonLine: P('return nums[lo]'), snapshot: snap(null, { result }), message: `The window is one index, so the minimum is ${result}.` })
  return { input: nums, result, frames }
}

export const code = `find minimum (nums):
  lo, hi = 0, len(nums) - 1
  while lo < hi:
    mid = (lo + hi) // 2
    if nums[mid] > nums[hi]:
      lo = mid + 1
    elif nums[mid] < nums[hi]:
      hi = mid
    else:
      hi -= 1
  return nums[lo]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        elif nums[mid] < nums[hi]:
            hi = mid
        else:
            hi -= 1
    return nums[lo]
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
