export const phases = [
  { id: 'start', label: 'Start X', description: 'X starts at 0 before any operation.' },
  { id: 'op', label: 'Apply operation', description: 'Each operation contains a plus or a minus, which changes X by one.' },
  { id: 'done', label: 'Result', description: 'The value of X after all operations.' },
]

export const code = `function finalValueAfterOperations(operations) {
  let x = 0
  for (const op of operations) {
    x += op.includes('+') ? 1 : -1
  }
  return x
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def final_value_after_operations(operations):
    x = 0
    for op in operations:
        x += 1 if '+' in op else -1
    return x
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let ops
  try { ops = JSON.parse(text) } catch { throw new Error('Use a JSON array such as ["--X","X++","X++"].') }
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 100) throw new Error('Give 1 to 100 operations.')
  if (!ops.every(op => ['++X', 'X++', '--X', 'X--'].includes(op))) throw new Error('Each operation must be ++X, X++, --X or X--.')
  return ops
}

export function buildTrace(ops) {
  const frames = []
  let x = 0
  const add = (phase, c, p, message, index) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { ops, index, x },
  })
  add('start', 'let x = 0', 'x = 0', 'X starts at 0.', -1)
  ops.forEach((op, i) => {
    x += op.includes('+') ? 1 : -1
    add('op', 'x += op', 'x += 1 if', `${op} changes X to ${x}.`, i)
  })
  add('done', 'return x', 'return x', `Final value of X is ${x}.`, ops.length - 1)
  return { input: ops, result: x, frames }
}
