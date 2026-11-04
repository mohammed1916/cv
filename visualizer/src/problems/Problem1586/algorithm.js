const OPS = ['next', 'prev', 'hasNext', 'hasPrevious']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.values) || input.values.length < 1 || input.values.length > 10) throw new Error('values is a list of 1 to 10 numbers.')
  if (!input.values.every((v, i) => Number.isInteger(v) && (i === 0 || v > input.values[i - 1]))) throw new Error('values must be strictly increasing integers (in-order walk).')
  if (!Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 20) throw new Error('ops is a list of 1 to 20 calls.')
  if (!input.ops.every(op => OPS.includes(op))) throw new Error('Each op is next, prev, hasNext or hasPrevious.')
  return input
}

export function buildTrace({ values, ops }) {
  let cursor = -1
  const answers = []
  const state = () => [`cursor ${cursor < 0 ? 'before the first value' : `on ${values[cursor]}`}`, `in-order: ${values.join(', ')}`]
  const frames = [{ phase: 'start', pythonLine: PL('cursor = -1'), activeLine: L('start with the cursor before'), state: state(), cursor, message: 'The cursor starts before the first value.' }]
  for (const op of ops) {
    if (op === 'next') {
      const moved = cursor + 1 < values.length
      if (moved) cursor++
      answers.push(moved ? values[cursor] : null)
      frames.push({ phase: 'next', pythonLine: moved ? PL('cursor += 1') : PL('answers.append(None)'), activeLine: L('if next then'), state: state(), cursor, message: moved ? `next moves forward to ${values[cursor]}.` : 'next has nothing ahead, so it returns null.' })
    } else if (op === 'prev') {
      const moved = cursor - 1 >= 0
      if (moved) cursor--
      answers.push(moved ? values[cursor] : null)
      frames.push({ phase: 'prev', pythonLine: moved ? PL('cursor -= 1') : PL('answers.append(None)'), activeLine: L('if prev then'), state: state(), cursor, message: moved ? `prev moves back to ${values[cursor]}.` : 'prev has nothing behind, so it returns null.' })
    } else if (op === 'hasNext') {
      answers.push(cursor + 1 < values.length)
      frames.push({ phase: 'query', pythonLine: PL('answers.append(cursor + 1 < len'), activeLine: L('if hasNext or hasPrevious'), state: state(), cursor, message: `hasNext is ${cursor + 1 < values.length}.` })
    } else {
      answers.push(cursor - 1 >= 0)
      frames.push({ phase: 'query', pythonLine: PL('answers.append(cursor - 1 >= 0)'), activeLine: L('if hasNext or hasPrevious'), state: state(), cursor, message: `hasPrevious is ${cursor - 1 >= 0}.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: PL('return answers'), activeLine: L('return the answers'), state: state(), cursor, message: 'All calls are finished.' })
  return { input: { values, ops }, result: answers, frames }
}

export const code = `bst iterator with a movable cursor
  start with the cursor before the first value
  for each operation in order
    if next then move forward when a value remains
    if prev then move back when a value remains
    if hasNext or hasPrevious then report whether a move is possible
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def bst_iterator(values, ops):
    cursor = -1
    answers = []
    for op in ops:
        if op == "next":
            if cursor + 1 < len(values):
                cursor += 1
                answers.append(values[cursor])
            else:
                answers.append(None)
        elif op == "prev":
            if cursor - 1 >= 0:
                cursor -= 1
                answers.append(values[cursor])
            else:
                answers.append(None)
        elif op == "hasNext":
            answers.append(cursor + 1 < len(values))
        else:
            answers.append(cursor - 1 >= 0)
    return answers
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
