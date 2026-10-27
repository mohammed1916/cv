export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 1000) throw new Error('Enter a JSON array of 1–1,000 operations: integer strings, "+", "D" or "C".')
  for (const op of ops) if (typeof op !== 'string' || !(/^-?\d{1,5}$/.test(op) || op === '+' || op === 'D' || op === 'C')) throw new Error(`Unknown operation ${JSON.stringify(op)}.`)
  return ops
}

// A stack of scores: '+' adds the last two, 'D' doubles the last, 'C' removes the last.
export function buildTrace(ops) {
  const stack = []
  const frames = [{ phase: 'start', op: null, stack: [], activeLine: 2, message: 'Start with an empty record.' }]
  for (const op of ops) {
    if (op === '+') stack.push(stack[stack.length - 1] + stack[stack.length - 2])
    else if (op === 'D') stack.push(stack[stack.length - 1] * 2)
    else if (op === 'C') stack.pop()
    else stack.push(Number(op))
    const phase = op === '+' || op === 'D' ? 'derive' : op === 'C' ? 'undo' : 'record'
    frames.push({ phase, op, stack: [...stack], activeLine: phase === 'derive' ? 5 : phase === 'undo' ? 7 : 3,
      message: phase === 'record' ? `Record ${op}.` : phase === 'derive' ? `${op === '+' ? 'Sum of the last two' : 'Double the last'} score: ${stack.at(-1)}.` : `Cancel the last score (${stack.length ? 'now ' + stack.at(-1) : 'record empty'}).` })
  }
  const result = stack.reduce((a, b) => a + b, 0)
  frames.push({ phase: 'done', op: null, stack: [...stack], result, activeLine: 9, message: `Total of the record: ${result}.` })
  return { input: ops, result, frames }
}

export const code = `create an empty stack of valid round scores
for each operation in order
  if the operation is a number then push it
  otherwise if it is C then remove the last score, if D push twice the last score, if + push the sum of the last two scores
return the sum of the scores left on the stack`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 4 applies any operation to the stack: a number pushes (line 3), a C, D or + edits the stack (line 4).
export function familyLine(frame) {
  if (frame.activeLine === 4) return /^Apply [-+]?\d+ /.test(frame.message) ? 3 : 4
  return ({ 1: 1, 5: 5 })[frame.activeLine] ?? frame.activeLine
}

export const python = `def cal_points(operations):
    scores = []
    for op in operations:
        if op == 'C':
            scores.pop()
        elif op == 'D':
            scores.append(2 * scores[-1])
        elif op == '+':
            scores.append(scores[-1] + scores[-2])
        else:
            scores.append(int(op))
    return sum(scores)`
