export const phases = [
  { id: 'start', label: 'Start', description: 'Put one pointer on the smallest value and one on the largest.' },
  { id: 'loop', label: 'Check window', description: 'While left is before right, the window still holds a candidate pair.' },
  { id: 'compare', label: 'Add ends', description: 'Add the two pointed values.' },
  { id: 'equal-check', label: 'Match test', description: 'Test whether the sum equals the target. A failed test moves nothing by itself.' },
  { id: 'less-check', label: 'Size test', description: 'Test whether the sum is smaller than the target.' },
  { id: 'move-left', label: 'Raise left', description: 'The sum is too small, so the left pointer moves right to a larger value.' },
  { id: 'move-right', label: 'Lower right', description: 'The sum is too large, so the right pointer moves left to a smaller value.' },
  { id: 'found', label: 'Pair found', description: 'The sum equals the target. Return the 1-based positions of the two values.' },
  { id: 'done', label: 'Complete', description: 'The pointers have met without a match, so no pair exists.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"numbers": [1, 4, 6], "target": 7}.')
  const { numbers, target } = input
  if (!Array.isArray(numbers) || numbers.length < 2 || numbers.length > 30 || !numbers.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('numbers is a list of 2 to 30 integers from -1000 to 1000.')
  for (let i = 1; i < numbers.length; i++) if (numbers[i] < numbers[i - 1]) throw new Error('numbers must be sorted in non-decreasing order.')
  if (!Number.isInteger(target) || Math.abs(target) > 2000) throw new Error('target is an integer from -2000 to 2000.')
  return { numbers, target }
}

// activeLine uses the displayed pseudocode; pythonLine uses the displayed Python listing.
const C = { header: 1, pointers: 2, loop: 3, total: 4, equal: 5, less: 6, lower: 7, none: 8 }
const PY = { header: 1, pointers: 2, loop: 3, total: 4, equal: 5, found: 6, less: 7, raise: 8, lower: 10, none: 11 }

export function buildTrace({ numbers, target }) {
  const frames = []
  const push = (phase, line, pyLine, message, snapshot) => frames.push({ phase, activeLine: C[line], pythonLine: PY[pyLine], snapshot, message })
  let left = 0
  let right = numbers.length - 1
  let result = null

  push('start', 'pointers', 'pointers', `Target ${target}. Left starts at position 1 and right starts at position ${numbers.length}.`, { left, right, total: null, target })
  while (true) {
    // Condition-only frame: the loop test runs before every window check, including the final failing test.
    if (left >= right) break
    push('loop', 'loop', 'loop', `left (position ${left + 1}) is before right (position ${right + 1}), so a candidate pair remains.`, { left, right, total: null, target })
    const total = numbers[left] + numbers[right]
    push('compare', 'total', 'total', `${numbers[left]} + ${numbers[right]} = ${total}.`, { left, right, total, target })
    if (total === target) {
      result = [left + 1, right + 1]
      push('found', 'equal', 'found', `${total} equals the target ${target}, so the pair at positions ${result[0]} and ${result[1]} is the answer.`, { left, right, total, target })
      break
    }
    // Condition-only frame: the equality test failed, so the pointers have not moved yet.
    push('equal-check', 'equal', 'equal', `${total} is not ${target}, so the pair is rejected and the size test decides which pointer moves.`, { left, right, total, target })
    if (total < target) {
      push('less-check', 'less', 'less', `${total} is smaller than ${target}, so a larger sum is needed.`, { left, right, total, target })
      left++
      push('move-left', 'less', 'raise', `Left moves to position ${left + 1}. The value at right is kept because a larger left value is the only way to raise the sum.`, { left: left - 1, right, total, target, moved: 'left', to: left })
    } else {
      push('less-check', 'less', 'less', `${total} is larger than ${target}, so a smaller sum is needed.`, { left, right, total, target })
      right--
      push('move-right', 'lower', 'lower', `Right moves to position ${right + 1}. The value at left is kept because a smaller right value is the only way to lower the sum.`, { left, right: right + 1, total, target, moved: 'right', to: right })
    }
  }
  if (!result) push('done', 'none', 'none', 'The pointers met without a matching pair, so there is no answer.', { left, right, total: null, target })
  return { input: { numbers, target }, result, frames }
}

export const code = `two sum sorted (numbers, target):
  left = 0, right = last position
  while left < right:
    total = numbers[left] + numbers[right]
    if total == target: return [left + 1, right + 1]
    if total < target: move left one step right
    else: move right one step left
  return none`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def two_sum_sorted(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        total = numbers[left] + numbers[right]
        if total == target:
            return [left + 1, right + 1]
        if total < target:
            left += 1
        else:
            right -= 1
    return None
`
