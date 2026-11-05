// The largest square is always at one of the two ends, because the values are sorted and squaring makes
// negatives grow toward the left. Two pointers walk in from both ends and fill the result from the back.
export const code = String.raw`function sortedSquares(nums) {
  const result = new Array(nums.length);
  let l = 0; // left pointer: the most negative remaining value
  let r = nums.length - 1; // right pointer: the largest remaining value
  for (let write = nums.length - 1; write >= 0; write--) {
    const left = nums[l] * nums[l];
    const right = nums[r] * nums[r];
    if (left > right) {
      result[write] = left;
      l++;
    } else {
      result[write] = right;
      r--;
    }
  }
  return result;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def sorted_squares(nums):
    result = [0] * len(nums)
    l = 0  # left pointer: the most negative remaining value
    r = len(nums) - 1  # right pointer: the largest remaining value
    for write in range(len(nums) - 1, -1, -1):
        left = nums[l] * nums[l]
        right = nums[r] * nums[r]
        if left > right:
            result[write] = left
            l += 1
        else:
            result[write] = right
            r -= 1
    return result`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Two ends', description: 'Compare the squares at the two pointers and place the larger at the back.' },
  { id: 'done', label: 'Sorted squares', description: 'Every square is placed in order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input && input.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use nums: a sorted list of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > 100)) throw new Error('Values must be integers from -100 to 100.')
  for (let i = 1; i < nums.length; i++) if (nums[i - 1] > nums[i]) throw new Error('The values must be sorted from smallest to largest.')
  return { nums }
}

export function buildTrace({ nums }) {
  const result = new Array(nums.length).fill(null)
  let l = 0
  let r = nums.length - 1
  const frames = []
  for (let write = nums.length - 1; write >= 0; write--) {
    const left = nums[l] * nums[l]
    const right = nums[r] * nums[r]
    const takeLeft = left > right
    frames.push({
      phase: 'scan', activeLine: L(takeLeft ? 'result[write] = left' : 'result[write] = right'), pythonLine: PY(takeLeft ? 'result[write] = left' : 'result[write] = right'),
      l, r, write, left, right, result: [...result],
      message: takeLeft ? `${nums[l]}² = ${left} is larger than ${nums[r]}² = ${right}. Place ${left} at position ${write} and move the left pointer in.`
        : `${nums[r]}² = ${right} is at least ${nums[l]}² = ${left}. Place ${right} at position ${write} and move the right pointer in.`,
    })
    if (takeLeft) { result[write] = left; l++ } else { result[write] = right; r-- }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: PY('return result'), l: null, r: null, write: null, left: null, right: null, result: [...result], message: 'Every square is placed, and the result is in order.' })
  return { input: { nums }, result, frames }
}
