export function parseInput(text) {
  const data = JSON.parse(text)
  const { values } = data ?? {}
  if (!Array.isArray(values) || values.length < 1 || values.length > 10) throw new Error('Use "values" as the list of 1 to 10 node values, in order.')
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each value is an integer from 1 to 10.')
  return { values }
}

export function buildTrace({ values }) {
  const answer = Array(values.length).fill(0)
  const stack = []
  const frames = [{ phase: 'start', activeLine: L('set answer to zeros'), index: -1, stack: [], answer: [...answer], message: 'Every answer starts at 0 until a larger value is found.' }]
  values.forEach((v, i) => {
    while (stack.length && values[stack[stack.length - 1]] < v) {
      const p = stack.pop()
      answer[p] = v
      frames.push({ phase: 'resolve', activeLine: L('answer at that position with the value'), index: i, stack: [...stack], answer: [...answer], message: `Value ${v} is the next greater value for position ${p}.` })
    }
    stack.push(i)
    frames.push({ phase: 'push', activeLine: L('push i onto the stack'), index: i, stack: [...stack], answer: [...answer], message: `Position ${i} (value ${v}) waits for a larger value.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answer'), index: -1, stack: [...stack], answer: [...answer], message: 'Positions left on the stack have no larger value, so they stay 0.' })
  return { input: { values }, result: answer, frames }
}

export const code = `next greater value for each position in the list
  set answer to zeros, one for each position
  set stack to an empty list of positions
  for each position i in order with value v
    while the stack is not empty and the value at its top is less than v
      pop the top position p and answer at that position with the value v
    push i onto the stack
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def next_greater_values(values):
    answer = [0] * len(values)
    stack = []
    for i, v in enumerate(values):
        while stack and values[stack[-1]] < v:
            answer[stack.pop()] = v
        stack.append(i)
    return answer
`
