export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 1000 || ops.some(op => typeof op !== 'string')) throw new Error('Enter 1–1,000 operations as JSON strings: an integer, "C", "D" or "+".')
  let depth = 0
  for (const op of ops) {
    if (op === 'C') { if (depth < 1) throw new Error('C needs a score to remove.'); depth-- }
    else if (op === 'D' || op === '+') { if (depth < (op === '+' ? 2 : 1)) throw new Error(`${op} needs ${op === '+' ? 'two' : 'one'} previous score(s).`); depth++ }
    else if (/^-?\d+$/.test(op) && Math.abs(Number(op)) <= 30000) depth++
    else throw new Error(`Unknown operation: ${op}`)
  }
  return ops
}

// Keep the valid scores on a stack. C removes the last score, D doubles the last score, + adds the last two.
export function buildTrace(ops) {
  const stack = []
  const dropped = []
  const frames = [{ phase: 'start', op: null, stack: [], dropped: [], result: null, activeLine: L('const stack = []'), pythonLine: P('stack = []'), message: 'The record starts empty.' }]
  for (const op of ops) {
    if (op === 'C') {
      dropped.push(stack.pop())
      frames.push({ phase: 'cancel', op, stack: [...stack], dropped: [...dropped], result: null, activeLine: L("op === 'C'"), pythonLine: P("if op == 'C'"), message: `C: remove the last score, leaving ${stack.length} on the record.` })
    } else if (op === 'D') {
      stack.push(2 * stack[stack.length - 1])
      frames.push({ phase: 'double', op, stack: [...stack], dropped: [...dropped], result: null, activeLine: L("op === 'D'"), pythonLine: P("elif op == 'D'"), message: `D: double the last score to ${stack[stack.length - 1]}.` })
    } else if (op === '+') {
      stack.push(stack[stack.length - 1] + stack[stack.length - 2])
      frames.push({ phase: 'sum', op, stack: [...stack], dropped: [...dropped], result: null, activeLine: L("op === '+'"), pythonLine: P("elif op == '+'"), message: `+: add the last two scores to get ${stack[stack.length - 1]}.` })
    } else {
      stack.push(Number(op))
      frames.push({ phase: 'score', op, stack: [...stack], dropped: [...dropped], result: null, activeLine: L('stack.push(Number(op))'), pythonLine: P('stack.append(int(op))'), message: `Record the score ${op}.` })
    }
  }
  const result = stack.reduce((a, b) => a + b, 0)
  frames.push({ phase: 'done', op: null, stack: [...stack], dropped: [...dropped], result, activeLine: L('return'), pythonLine: P('return sum'), message: `Total of the record: ${result}.` })
  return { input: ops, result, frames }
}

const SOURCE = `function calPoints(ops) {
  const stack = []
  for (const op of ops) {
    if (op === 'C') {
      stack.pop()
    } else if (op === 'D') {
      stack.push(2 * stack[stack.length - 1])
    } else if (op === '+') {
      stack.push(stack[stack.length - 1] + stack[stack.length - 2])
    } else {
      stack.push(Number(op))
    }
  }
  return stack.reduce((a, b) => a + b, 0)
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def cal_points(ops):
    stack = []
    for op in ops:
        if op == 'C':
            stack.pop()
        elif op == 'D':
            stack.append(2 * stack[-1])
        elif op == '+':
            stack.append(stack[-1] + stack[-2])
        else:
            stack.append(int(op))
    return sum(stack)`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
