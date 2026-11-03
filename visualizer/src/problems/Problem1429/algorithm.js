export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 20) throw new Error('Use an object with ops, 1 to 20 operations.')
  for (const op of input.ops) {
    if (op[0] === 'add' && Number.isInteger(op[1]) && op[1] >= 1 && op[1] <= 20) continue
    if (op[0] === 'first' && op.length === 1) continue
    throw new Error('Use ["add", value] or ["first"] with values from 1 to 20.')
  }
  return input
}

export function buildTrace({ ops }) {
  const counts = new Map()
  const order = []
  const answers = []
  const frames = [{ phase: 'start', pythonLine: PL('counts = {}'), activeLine: L('start with no counts'), state: [], message: 'No numbers have been added.' }]
  for (const op of ops) {
    if (op[0] === 'add') {
      const v = op[1]
      counts.set(v, (counts.get(v) || 0) + 1)
      if (counts.get(v) === 1) order.push(v)
      frames.push({ phase: 'add', pythonLine: PL('order.append(op[1])'), activeLine: L('count it and remember'), state: order.map(x => `${x} seen ${counts.get(x)}x`), message: `Add ${v}; it now appears ${counts.get(v)} time${counts.get(v) === 1 ? '' : 's'}.` })
    } else {
      let answer = -1
      for (const v of order) {
        if (counts.get(v) === 1) { answer = v; break }
      }
      answers.push(answer)
      frames.push({ phase: 'first', pythonLine: PL('for v in order'), activeLine: L('scan the remembered values'), state: order.map(x => `${x} seen ${counts.get(x)}x`), message: `The first unique value is ${answer}.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: PL('return answers'), activeLine: L('return the answers'), state: order.map(x => `${x} seen ${counts.get(x)}x`), message: 'All operations are finished.' })
  return { input: { ops }, result: answers, frames }
}

export const code = `first unique number in a stream
  start with no counts
  for each operation in order
    if the operation adds a value then count it and remember its first sighting
    otherwise scan the remembered values in order for one with count one
      record the answer, or -1 when none exists
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def first_unique(ops):
    counts = {}
    order = []
    answers = []
    for op in ops:
        if op[0] == "add":
            counts[op[1]] = counts.get(op[1], 0) + 1
            if counts[op[1]] == 1:
                order.append(op[1])
        else:
            answer = -1
            for v in order:
                if counts[v] == 1:
                    answer = v
                    break
            answers.append(answer)
    return answers
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
