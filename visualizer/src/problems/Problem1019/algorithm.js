export function parseInput(text) {
  const data = JSON.parse(text)
  const { values } = data ?? {}
  if (!Array.isArray(values) || values.length < 1 || values.length > 10) throw new Error('Use "values" as the list of 1 to 10 node values, in order.')
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each value is an integer from 1 to 10.')
  return { values }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function nextGreaterValues(values) {', 'def next_greater_values(values):'],
  ['  const answer = Array(values.length).fill(0)', '    answer = [0] * len(values)'],
  ['  const stack = []', '    stack = []'],
  ['  for (let i = 0; i < values.length; i++) { const v = values[i]', '    for i, v in enumerate(values):'],
  ['    while (stack.length > 0 && values[stack[stack.length - 1]] < v) {', '        while stack and values[stack[-1]] < v:'],
  ['      answer[stack.pop()] = v', '            answer[stack.pop()] = v'],
  ['    }', ''],
  ['    stack.push(i)', '        stack.append(i)'],
  ['  }', ''],
  ['  return answer', '    return answer'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ values }) {
  const answer = Array(values.length).fill(0)
  const stack = []
  const frames = [{ phase: 'start', pythonLine: P('answer = [0]'), activeLine: L('const answer = Array'), index: -1, stack: [], answer: [...answer], message: 'Every answer starts at 0 until a larger value is found.' }]
  values.forEach((v, i) => {
    while (stack.length && values[stack[stack.length - 1]] < v) {
      const p = stack.pop()
      answer[p] = v
      frames.push({ phase: 'resolve', pythonLine: P('answer[stack.pop()]'), activeLine: L('answer[stack.pop()]'), index: i, stack: [...stack], answer: [...answer], message: `Value ${v} is the next greater value for position ${p}.` })
    }
    stack.push(i)
    frames.push({ phase: 'push', pythonLine: P('stack.append(i)'), activeLine: L('stack.push(i)'), index: i, stack: [...stack], answer: [...answer], message: `Position ${i} (value ${v}) waits for a larger value.` })
  })
  frames.push({ phase: 'done', pythonLine: P('return answer'), activeLine: L('return answer'), index: -1, stack: [...stack], answer: [...answer], message: 'Positions left on the stack have no larger value, so they stay 0.' })
  return { input: { values }, result: answer, frames }
}
