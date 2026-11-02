const CODE = [
  'FUNCTION minOperations(nums)',
  '    i ← 0, j ← last index',
  '    left ← nums[i], right ← nums[j], ops ← 0',
  '    WHILE i < j',
  '        IF left equals right THEN move i inward, j inward, and reset left and right',
  '        ELSE IF left < right THEN merge the left end with its neighbour, ops ← ops + 1',
  '        ELSE merge the right end with its neighbour, ops ← ops + 1',
  '    RETURN ops',
]

const PY = [
  'def min_operations(nums):',
  '    i, j = 0, len(nums) - 1',
  '    left, right = nums[i], nums[j]',
  '    ops = 0',
  '    while i < j:',
  '        if left == right:',
  '            i += 1',
  '            j -= 1',
  '            if i < j:',
  '                left, right = nums[i], nums[j]',
  '        elif left < right:',
  '            i += 1',
  '            left += nums[i]',
  '            ops += 1',
  '        else:',
  '            j -= 1',
  '            right += nums[j]',
  '            ops += 1',
  '    return ops',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Ends', description: 'Put one pointer at each end of the array.' },
  { id: 'compare', label: 'Compare', description: 'Compare the two end groups.' },
  { id: 'match', label: 'Match', description: 'The end groups are equal, so both move inward.' },
  { id: 'merge', label: 'Merge', description: 'The smaller end group absorbs its neighbour.' },
  { id: 'done', label: 'Result', description: 'The middle is a palindrome.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Values are positive integers up to 100 in this visualization.')
  return nums
}

export function buildTrace(nums) {
  let i = 0
  let j = nums.length - 1
  let left = nums[i]
  let right = nums[j]
  let ops = 0
  const frames = []
  const snap = (phase, activeLine, pythonLine, message) => frames.push({ pythonLine, phase, activeLine, i, j, left, right, ops, nums: [...nums], message })
  snap('start', codeLine('i ← 0, j ← last index'), pyLine('i, j = 0, len(nums) - 1'), `Pointers start at both ends. The left group is ${left} and the right group is ${right}.`)
  while (i < j) {
    snap('compare', codeLine('WHILE i < j'), pyLine('while i < j:'), `Compare left group ${left} with right group ${right}.`)
    if (left === right) {
      i += 1
      j -= 1
      if (i < j) {
        left = nums[i]
        right = nums[j]
      }
      snap('match', codeLine('IF left equals right THEN move i inward, j inward, and reset left and right'), pyLine('i += 1'), i < j ? `They match, so both ends step inward. New groups are ${left} and ${right}.` : 'They match and the pointers meet. The rest is a palindrome.')
    } else if (left < right) {
      i += 1
      left += nums[i]
      ops += 1
      snap('merge', codeLine('ELSE IF left < right THEN merge the left end with its neighbour, ops ← ops + 1'), pyLine('left += nums[i]'), `${left - nums[i]} is smaller, so it merges with its neighbour ${nums[i]} to make ${left}. Operations: ${ops}.`)
    } else {
      j -= 1
      right += nums[j]
      ops += 1
      snap('merge', codeLine('ELSE merge the right end with its neighbour, ops ← ops + 1'), pyLine('right += nums[j]'), `${right - nums[j]} is smaller, so it merges with its neighbour ${nums[j]} to make ${right}. Operations: ${ops}.`)
    }
  }
  snap('done', codeLine('RETURN ops'), pyLine('return ops'), `The array becomes a palindrome after ${ops} merge${ops === 1 ? '' : 's'}.`)
  return { input: nums, result: ops, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
