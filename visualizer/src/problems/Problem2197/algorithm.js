// LeetCode 2197: Replace Non-Coprime Numbers in Array.
// Scan left to right with a stack. The incoming value x merges with the stack top while they share a factor:
// x becomes lcm(top, x), and the top is popped. Merging never loses a multiple, so the final stack is the answer.

const MAX_LEN = 10
const MAX_VALUE = 60

function gcd(a, b) { while (b) { [a, b] = [b, a % b] } return a }

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of positive integers, e.g. [6,4,3,2,7,6,2].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} values. The visualization caps the length there.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE}.`)
  return { nums }
}

export const code = `FUNCTION replaceNonCoprimes(nums)
    stack ← empty list
    FOR each value x in nums
        WHILE stack is not empty AND gcd(top of stack, x) > 1
            x ← lcm(top of stack, x)
            pop the stack
        push x onto the stack
    RETURN stack`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from math import gcd

def replace_non_coprimes(nums):
    stack = []
    for x in nums:
        while stack and gcd(stack[-1], x) > 1:
            x = stack[-1] * x // gcd(stack[-1], x)
            stack.pop()
        stack.append(x)
    return stack
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Stack', description: 'Start with an empty stack.' },
  { id: 'merge', label: 'Merge', description: 'Merge the incoming value with the top while they share a factor.' },
  { id: 'push', label: 'Push', description: 'Push the value that no longer shares a factor with the top.' },
  { id: 'done', label: 'Result', description: 'The stack is the final array.' },
]

export function buildTrace({ nums }) {
  const stack = []
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index, activeLine, pythonLine, message, nums, stack: stack.slice(), ...extra,
  })
  push('start', -1, L('stack ← empty'), P('stack = []'), `Values to process: ${nums.join(', ')}.`)
  nums.forEach((value, i) => {
    let x = value
    while (stack.length && gcd(stack[stack.length - 1], x) > 1) {
      const top = stack[stack.length - 1]
      const g = gcd(top, x)
      const merged = (top * x) / g
      push('merge', i, L('WHILE stack is not empty'), P('while stack and gcd'),
        `${top} and ${x} share the factor ${g}. Replace ${x} with lcm ${merged} and pop ${top}.`, { x, top, merged, gcd: g })
      stack.pop()
      x = merged
    }
    stack.push(x)
    push('push', i, L('push x onto the stack'), P('stack.append(x)'), `Push ${x}. The stack is now ${stack.join(', ')}.`, { x })
  })
  push('done', -1, L('RETURN stack'), P('return stack'), `The final array is ${stack.join(', ')}.`, { result: stack.slice() })
  return { input: { nums }, result: stack.slice(), frames }
}
