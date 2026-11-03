export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty stack. Each slot will remember its value and the smallest value at or below it.' },
  { id: 'push', label: 'Push', description: 'Store the value with the minimum of itself and the slot below, so the current minimum is always on top.' },
  { id: 'pop', label: 'Pop', description: 'Remove the top slot. The minimum of the slot below is already correct, so nothing else changes.' },
  { id: 'read', label: 'Read top or min', description: 'Read the top value or the stored minimum from the top slot without changing the stack.' },
  { id: 'done', label: 'Complete', description: 'Return the values reported by the top and getMin calls, in order.' },
]

const OPS = ['push', 'pop', 'top', 'getMin']

export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 30) throw new Error('Enter a JSON array of 1 to 30 operations, such as [["push", -2], ["getMin"]].')
  let size = 0
  for (const op of ops) {
    if (!Array.isArray(op) || !OPS.includes(op[0])) throw new Error('Each operation is ["push", value], ["pop"], ["top"] or ["getMin"].')
    if (op[0] === 'push') {
      if (op.length !== 2 || !Number.isInteger(op[1]) || op[1] < -100 || op[1] > 100) throw new Error('A push needs one integer from -100 to 100.')
      size++
    } else {
      if (op.length !== 1) throw new Error(`${op[0]} takes no value.`)
      if (size === 0) throw new Error(`${op[0]} needs a non-empty stack at that point.`)
      if (op[0] === 'pop') size--
    }
  }
  return ops
}

export const code = `class MinStack:
    push(val): low = val if empty else min(val, top.low); push (val, low)
    pop(): remove the top pair
    top(): return the top value
    getMin(): return the top low`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class MinStack:
    def __init__(self):
        self.stack = []

    def push(self, val):
        low = val if not self.stack else min(val, self.stack[-1][1])
        self.stack.append((val, low))

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1][0]

    def getMin(self):
        return self.stack[-1][1]
`
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(ops) {
  const frames = []
  const stack = []
  const outputs = []
  const snap = extra => ({ stack: stack.map(([value, low]) => ({ value, low })), ...extra })
  frames.push({ phase: 'start', activeLine: L('class MinStack'), pythonLine: P('self.stack = []'), snapshot: snap({ op: null }),
    message: `Run ${ops.length} operations on an empty stack.` })
  ops.forEach((op, i) => {
    const name = op[0]
    if (name === 'push') {
      const val = op[1]
      const low = stack.length ? Math.min(val, stack[stack.length - 1][1]) : val
      stack.push([val, low])
      frames.push({ phase: 'push', activeLine: L('push(val)'), pythonLine: P('def push'), snapshot: snap({ op: i, name, val, low }),
        message: `Push ${val}. The minimum of this slot is ${low}, the smaller of ${val} and the slot below.` })
    } else if (name === 'pop') {
      const [val] = stack.pop()
      frames.push({ phase: 'pop', activeLine: L('pop():'), pythonLine: P('self.stack.pop()'), snapshot: snap({ op: i, name, val }),
        message: `Pop removes ${val}. The minimum of the new top is already correct.` })
    } else {
      const [val, low] = stack[stack.length - 1]
      const result = name === 'top' ? val : low
      outputs.push(result)
      frames.push({ phase: 'read', activeLine: L(name === 'top' ? 'top():' : 'getMin():'), pythonLine: P(name === 'top' ? 'return self.stack[-1][0]' : 'return self.stack[-1][1]'), snapshot: snap({ op: i, name, result }),
        message: `${name === 'top' ? 'top' : 'getMin'} returns ${result}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('getMin():'), pythonLine: P('return self.stack[-1][1]'), snapshot: snap({ op: ops.length, name: null }),
    message: `Reported values: ${outputs.length ? outputs.join(', ') : 'none'}.` })
  return { input: ops, result: outputs, frames }
}
