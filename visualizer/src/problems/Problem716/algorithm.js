const OPS = ['push', 'pop', 'top', 'peekMax', 'popMax']

export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 30) throw new Error('Use 1 to 30 operations.')
  let size = 0
  for (const [kind, value] of ops) {
    if (!OPS.includes(kind)) throw new Error(`Unknown operation ${kind}: use push, pop, top, peekMax or popMax.`)
    if (kind === 'push') {
      if (!Number.isInteger(value) || Math.abs(value) > 1000) throw new Error('push needs an integer from -1000 to 1000.')
      size++
    } else {
      if (size === 0) throw new Error(`${kind} needs a non-empty stack.`)
      if (kind === 'pop' || kind === 'popMax') size--
    }
  }
  return ops
}

export function buildTrace(ops) {
  const stack = []
  const result = []
  const frames = [{ phase: 'start', activeLine: L('self.stack = []'), stack: [], index: null, result: null, message: 'An empty stack. popMax removes the largest value, and the most recent one if values tie.' }]
  for (const [kind, value] of ops) {
    let out = null, index = null, activeLine, message
    if (kind === 'push') {
      stack.push(value)
      activeLine = L('self.stack.append')
      message = `Push ${value}.`
    } else if (kind === 'pop') {
      out = stack.pop()
      activeLine = L('return self.stack.pop()')
      message = `Pop ${out}.`
    } else if (kind === 'top') {
      out = stack.at(-1)
      activeLine = L('return self.stack[-1]')
      message = `The top is ${out}.`
    } else if (kind === 'peekMax') {
      out = Math.max(...stack)
      activeLine = L('return max(self.stack)')
      message = `The largest value is ${out}.`
    } else {
      const best = Math.max(...stack)
      index = stack.lastIndexOf(best)
      out = stack.splice(index, 1)[0]
      activeLine = L('return self.stack.pop(index)')
      message = `Remove ${out}: the largest value, and the most recent one if values tie.`
    }
    result.push(out)
    frames.push({ phase: kind, activeLine, stack: [...stack], index, result: out, message })
  }
  frames.push({ phase: 'done', activeLine: L('return self.stack.pop(index)'), stack: [...stack], index: null, result: null, message: `${result.length} operation(s) complete.` })
  return { input: ops, result, frames }
}

export const code = `class MaxStack:
    def __init__(self):
        self.stack = []
    def push(self, x):
        self.stack.append(x)
    def pop(self):
        return self.stack.pop()
    def top(self):
        return self.stack[-1]
    def peekMax(self):
        return max(self.stack)
    def popMax(self):
        best = max(self.stack)
        index = len(self.stack) - 1 - self.stack[::-1].index(best)
        return self.stack.pop(index)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
