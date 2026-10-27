export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with one key, nums.')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) throw new Error('nums must be an array of 1 to 30 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each value is an integer from 1 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const steps = []
  const stack = []
  let answer = 0
  const frames = []
  const frame = (phase, line, index, message) => frames.push({ phase, activeLine: line, index, steps: [...steps], stack: stack.map(j => j), answer, message })
  frame('start', L('set answer to 0'), -1, 'Start with an empty stack of indices.')
  for (let i = 0; i < nums.length; i++) {
    let before = 0
    while (stack.length && nums[stack[stack.length - 1]] <= nums[i]) {
      const j = stack.pop()
      before = Math.max(before, steps[j])
      frame('pop', L('pop the top index'), i, `${nums[j]} at ${j} is at most ${nums[i]}, so it is popped with ${steps[j]} steps.`)
    }
    steps[i] = stack.length ? before + 1 : 0
    answer = Math.max(answer, steps[i])
    frame('record', L('set steps[i]'), i, steps[i] === 0 ? `${nums[i]} at ${i} is never removed.` : `${nums[i]} at ${i} is removed after ${steps[i]} steps.`)
    stack.push(i)
  }
  frame('done', L('return answer'), -1, `The array becomes non-decreasing after ${answer} steps.`)
  return { input: { nums }, result: answer, frames }
}

export const code = `steps to make the array non-decreasing
  set answer to 0
  set an empty stack of indices
  for each index i from left to right do
    set best before to 0
    while the stack is not empty and the value at its top is at most nums[i] do
      pop the top index j and set best before to the larger of best before and steps[j]
    if the stack is empty then set steps[i] to 0
    otherwise set steps[i] to best before + 1
    set answer to the larger of answer and steps[i]
    push i onto the stack
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def steps_to_non_decreasing(nums):
    steps = [0] * len(nums)
    stack = []
    answer = 0
    for i, value in enumerate(nums):
        best_before = 0
        while stack and nums[stack[-1]] <= value:
            j = stack.pop()
            best_before = max(best_before, steps[j])
        steps[i] = 0 if not stack else best_before + 1
        answer = max(answer, steps[i])
        stack.append(i)
    return answer
`
