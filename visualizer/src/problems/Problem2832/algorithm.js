// LeetCode 2832: Maximal Range That Each Element Is Maximum in It (draft rules).
// For index i, find the longest contiguous range containing i in which nums[i] is a maximum.
// Equal values may appear inside the range, so the boundaries stop only at strictly greater values.
// A monotonic stack finds the nearest strictly greater value on each side.

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a list of 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Each value is an integer from 1 to 20.')
  return nums
}

const CODE_TEXT = [
  'range length for each index in nums',
  '  left ← array of -1 for every index; right ← array of n for every index',
  '  stack ← empty',
  '  FOR i from 0 to n - 1',
  '    WHILE stack is not empty and nums[top of stack] ≤ nums[i]',
  '      pop the stack',
  '    IF stack is not empty THEN left[i] ← top of stack',
  '    push i onto the stack',
  '  stack ← empty',
  '  FOR i from n - 1 down to 0',
  '    WHILE stack is not empty and nums[top of stack] ≤ nums[i]',
  '      pop the stack',
  '    IF stack is not empty THEN right[i] ← top of stack',
  '    push i onto the stack',
  '  FOR each i',
  '    answer[i] ← right[i] - left[i] - 1',
  '  return answer',
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

const PYTHON_TEXT = `def maximal_range(nums):
    n = len(nums)
    left = [-1] * n
    right = [n] * n
    stack = []
    for i in range(n):
        while stack and nums[stack[-1]] <= nums[i]:
            stack.pop()
        if stack:
            left[i] = stack[-1]
        stack.append(i)
    stack = []
    for i in range(n - 1, -1, -1):
        while stack and nums[stack[-1]] <= nums[i]:
            stack.pop()
        if stack:
            right[i] = stack[-1]
        stack.append(i)
    return [right[i] - left[i] - 1 for i in range(n)]
`

export const python = PYTHON_TEXT

const P = s => {
  const index = PYTHON_TEXT.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'left', label: 'Left pass', description: 'Find the nearest strictly greater value to the left.' },
  { id: 'right', label: 'Right pass', description: 'Find the nearest strictly greater value to the right.' },
  { id: 'answer', label: 'Ranges', description: 'Turn the two boundaries into a length.' },
  { id: 'done', label: 'Result', description: 'Return every range length.' },
]

export function buildTrace(nums) {
  const n = nums.length
  const left = Array(n).fill(-1)
  const right = Array(n).fill(n)
  const frames = []
  let stack = []
  const snap = (extra) => ({ nums, left: [...left], right: [...right], stack: [...stack], ...extra })
  for (let i = 0; i < n; i++) {
    frames.push(snap({ phase: 'left', index: i, activeLine: L('FOR i from 0 to n - 1'), pythonLine: P('for i in range(n):'), popped: null, message: `Left pass at index ${i}, value ${nums[i]}.` }))
    while (stack.length && nums[stack[stack.length - 1]] <= nums[i]) {
      const popped = stack.pop()
      frames.push(snap({ phase: 'left', index: i, activeLine: L('pop the stack'), pythonLine: P('stack.pop()'), popped, message: `Pop ${popped} (value ${nums[popped]}) because it is not greater than ${nums[i]}.` }))
    }
    if (stack.length) left[i] = stack[stack.length - 1]
    frames.push(snap({ phase: 'left', index: i, activeLine: L('IF stack is not empty THEN left'), pythonLine: P('left[i] = stack[-1]'), popped: null, message: left[i] >= 0 ? `Left boundary for ${i} is index ${left[i]}.` : `No greater value to the left of ${i}.` }))
    stack.push(i)
    frames.push(snap({ phase: 'left', index: i, activeLine: L('push i onto the stack'), pythonLine: P('stack.append(i)'), popped: null, message: `Push ${i}.` }))
  }
  stack = []
  for (let i = n - 1; i >= 0; i--) {
    frames.push(snap({ phase: 'right', index: i, activeLine: L('FOR i from n - 1'), pythonLine: P('for i in range(n - 1, -1, -1):'), popped: null, message: `Right pass at index ${i}, value ${nums[i]}.` }))
    while (stack.length && nums[stack[stack.length - 1]] <= nums[i]) {
      const popped = stack.pop()
      frames.push(snap({ phase: 'right', index: i, activeLine: L('pop the stack'), pythonLine: P('stack.pop()'), popped, message: `Pop ${popped} (value ${nums[popped]}) because it is not greater than ${nums[i]}.` }))
    }
    if (stack.length) right[i] = stack[stack.length - 1]
    frames.push(snap({ phase: 'right', index: i, activeLine: L('IF stack is not empty THEN right'), pythonLine: P('right[i] = stack[-1]'), popped: null, message: right[i] < n ? `Right boundary for ${i} is index ${right[i]}.` : `No greater value to the right of ${i}.` }))
    stack.push(i)
  }
  const answer = []
  for (let i = 0; i < n; i++) {
    answer.push(right[i] - left[i] - 1)
    frames.push(snap({ phase: 'answer', index: i, activeLine: L('answer[i] ← right[i]'), pythonLine: P('return [right[i]'), popped: null, answer: [...answer], message: `Index ${i} stays maximum in ${answer[i]} positions.` }))
  }
  frames.push(snap({ phase: 'done', index: -1, activeLine: L('return answer'), pythonLine: P('return [right[i]'), popped: null, answer: [...answer], message: `Ranges: ${answer.join(', ')}.` }))
  return { input: nums, result: answer, frames }
}
