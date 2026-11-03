const CODE_TEXT = `set best to -1
for each middle index j from 1 to n minus 2
  find the largest value left of j that is below nums[j]
  find the largest value right of j that is above nums[j]
  if both exist then candidate = left - nums[j] + right, and keep the largest candidate in best
return best`

const PYTHON_TEXT = `def maximum_increasing_triplet_value(nums):
    best = -1
    for j in range(1, len(nums) - 1):
        left = None
        for i in range(j):
            if nums[i] < nums[j] and (left is None or nums[i] > left):
                left = nums[i]
        right = None
        for k in range(j + 1, len(nums)):
            if nums[k] > nums[j] and (right is None or nums[k] > right):
                right = nums[k]
        if left is not None and right is not None:
            best = max(best, left - nums[j] + right)
    return best`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON_TEXT
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`No pseudocode line: ${s}`); return i + 1 }
const PY = s => { const i = python.split('\n').findIndex(t => t.includes(s)); if (i < 0) throw new Error(`No python line: ${s}`); return i + 1 }

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 20) throw new Error('Use a JSON array of 3 to 20 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) throw new Error('Each value is an integer from 0 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let best = -1
  frames.push({ phase: 'start', activeLine: L('set best to -1'), pythonLine: PY('best = -1'), j: -1, left: null, right: null, leftIndex: -1, rightIndex: -1, candidate: null, best, message: 'No increasing triplet has been found yet, so best is -1.' })
  for (let j = 1; j <= nums.length - 2; j++) {
    let left = null
    let leftIndex = -1
    for (let i = 0; i < j; i++) {
      if (nums[i] < nums[j] && (left === null || nums[i] > left)) { left = nums[i]; leftIndex = i }
    }
    frames.push({ phase: 'left', activeLine: L('find the largest value left'), pythonLine: PY('for i in range(j)'), j, left, right: null, leftIndex, rightIndex: -1, candidate: null, best, message: left === null ? `Middle ${j}: nothing to the left is below ${nums[j]}.` : `Middle ${j}: the best left value is ${left} at index ${leftIndex}.` })
    let right = null
    let rightIndex = -1
    for (let k = j + 1; k < nums.length; k++) {
      if (nums[k] > nums[j] && (right === null || nums[k] > right)) { right = nums[k]; rightIndex = k }
    }
    frames.push({ phase: 'right', activeLine: L('find the largest value right'), pythonLine: PY('for k in range'), j, left, right, leftIndex, rightIndex, candidate: null, best, message: right === null ? `Middle ${j}: nothing to the right is above ${nums[j]}.` : `Middle ${j}: the best right value is ${right} at index ${rightIndex}.` })
    if (left !== null && right !== null) {
      const candidate = left - nums[j] + right
      best = Math.max(best, candidate)
      frames.push({ phase: 'candidate', activeLine: L('if both exist'), pythonLine: PY('if left is not None'), j, left, right, leftIndex, rightIndex, candidate, best, message: `Triplet value ${left} - ${nums[j]} + ${right} = ${candidate}; best is ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: PY('return best'), j: -1, left: null, right: null, leftIndex: -1, rightIndex: -1, candidate: null, best, message: best === -1 ? 'No increasing triplet exists, so the answer is -1.' : `The greatest value is ${best}.` })
  return { input: nums, result: best, frames }
}
