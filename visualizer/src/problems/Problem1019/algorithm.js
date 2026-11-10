export function parseInput(text) {
  const data = JSON.parse(text)
  const { values } = data ?? {}
  if (!Array.isArray(values) || values.length < 1 || values.length > 10) throw new Error('Use "values" as the list of 1 to 10 node values, in order.')
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each value is an integer from 1 to 10.')
  return { values }
}

// Each line of JavaScript is paired with the Python line on the same row. Blank Python cells are closing braces.
const LINES = [
  ['function nextGreaterValues(values) {', 'def next_greater_values(values):'],
  ['  const answer = Array(values.length).fill(0)', '    answer = [0] * len(values)'],
  ['  const stack = []', '    stack = []'],
  ['  for (let i = 0; i < values.length; i++) { const v = values[i]', '    for i, v in enumerate(values):'],
  ['    while (stack.length > 0 && values[stack[stack.length - 1]] < v) {', '        while stack and values[stack[-1]] < v:'],
  ['      const p = stack.pop()', '            p = stack.pop()'],
  ['      answer[p] = v', '            answer[p] = v'],
  ['    }', ''],
  ['    stack.push(i)', '        stack.append(i)'],
  ['  }', ''],
  ['  return answer', '    return answer'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
export const python = LINES.map(([, py]) => py).join('\n')

// Lookups use distinct fragments so each frame names exactly the row it executes.
const L = fragment => {
  const index = codeLines.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`no code line: ${fragment}`)
  return index + 1
}
const pythonLines = python.split('\n')
const P = fragment => {
  const index = pythonLines.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`no python line: ${fragment}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Every answer starts at 0.' },
  { id: 'resolve', label: 'Resolve', description: 'A larger value arrives, so waiting positions with smaller values are resolved.' },
  { id: 'push', label: 'Wait', description: 'Push this position; it waits for a larger value.' },
  { id: 'done', label: 'Complete', description: 'Positions still on the stack have no larger value.' },
]

// Frame kinds: start, read, check (condition only, with the top compared), pop, assign, push, result.
// Frames copy the stack and answers after the operation, so backward stepping shows real states.
export function buildTrace({ values }) {
  const answer = Array(values.length).fill(0)
  const stack = []
  const frames = []
  const emit = fields => frames.push({ index: -1, value: null, top: null, topValue: null, compare: null, popped: null, stack: [...stack], answer: [...answer], ...fields })

  emit({ kind: 'start', phase: 'start', activeLine: L('const answer = Array'), pythonLine: P('answer = [0]'), message: 'Every answer starts at 0 until a larger value is found.' })
  emit({ kind: 'start', phase: 'start', activeLine: L('const stack = []'), pythonLine: P('stack = []'), message: 'The stack starts empty: no position is waiting yet.' })

  values.forEach((v, i) => {
    emit({ kind: 'read', phase: 'resolve', index: i, value: v, activeLine: L('for (let i'), pythonLine: P('for i, v in enumerate'), message: `Read value ${v} at position ${i}.` })
    for (;;) {
      const top = stack.length ? stack[stack.length - 1] : null
      const topValue = top === null ? null : values[top]
      const compare = top !== null && topValue < v
      const message = top === null ? 'The stack is empty, so no position is waiting.'
        : compare ? `Top position ${top} (value ${topValue}) is smaller than ${v}.`
        : `Top position ${top} (value ${topValue}) is not smaller than ${v}, so nothing else resolves.`
      emit({ kind: 'check', phase: 'resolve', index: i, value: v, top, topValue, compare, activeLine: L('while (stack.length'), pythonLine: P('while stack and'), message })
      if (!compare) break
      const p = stack.pop()
      emit({ kind: 'pop', phase: 'resolve', index: i, value: v, popped: p, activeLine: L('const p = stack.pop()'), pythonLine: P('p = stack.pop()'), message: `Remove position ${p} from the stack; it is resolved.` })
      answer[p] = v
      emit({ kind: 'assign', phase: 'resolve', index: i, value: v, popped: p, activeLine: L('answer[p] = v'), pythonLine: P('answer[p] = v'), message: `Value ${v} is the next greater value for position ${p}.` })
    }
    stack.push(i)
    emit({ kind: 'push', phase: 'push', index: i, value: v, activeLine: L('stack.push(i)'), pythonLine: P('stack.append(i)'), message: `Position ${i} (value ${v}) waits for a larger value.` })
  })

  emit({ kind: 'result', phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), message: 'Positions left on the stack have no larger value, so they stay 0.' })
  return { input: { values }, result: answer, frames }
}
