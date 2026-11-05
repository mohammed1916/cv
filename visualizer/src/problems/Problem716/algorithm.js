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

export const code = `class MaxStack {
  constructor() {
    this.stack = [] // stack = empty list, bottom to top
  }
  push(value) {
    this.stack.push(value) // append value to stack
  }
  pop() {
    return this.stack.pop() // remove and return the top value
  }
  top() {
    return this.stack[this.stack.length - 1] // return the top value without removing it
  }
  peekMax() {
    return Math.max(...this.stack) // return the largest value in the stack
  }
  popMax() {
    const best = Math.max(...this.stack)
    const index = this.stack.lastIndexOf(best) // take its most recent position
    return this.stack.splice(index, 1)[0] // remove that entry and return it
  }
}
function maxStackOperations(ops) {
  const stack = new MaxStack()
  const results = [] // results = empty list
  for (const [kind, value] of ops) {
    if (kind === 'push') { stack.push(value); results.push(null) }
    else results.push(stack[kind]())
  }
  return results // return results
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(ops) {
  const stack = []
  const result = []
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: L('stack = empty list'), stack: [], index: null, result: null, message: 'An empty stack. popMax removes the largest value, and the most recent one if values tie.' }]
  for (const [kind, value] of ops) {
    let out = null, index = null, activeLine, message
    if (kind === 'push') {
      stack.push(value)
      activeLine = L('append value to stack')
      message = `Push ${value}.`
    } else if (kind === 'pop') {
      out = stack.pop()
      activeLine = L('remove and return the top value')
      message = `Pop ${out}.`
    } else if (kind === 'top') {
      out = stack.at(-1)
      activeLine = L('return the top value without removing it')
      message = `The top is ${out}.`
    } else if (kind === 'peekMax') {
      out = Math.max(...stack)
      activeLine = L('return the largest value in the stack')
      message = `The largest value is ${out}.`
    } else {
      const best = Math.max(...stack)
      index = stack.lastIndexOf(best)
      out = stack.splice(index, 1)[0]
      activeLine = L('take its most recent position')
      message = `Remove ${out}: the largest value, and the most recent one if values tie.`
    }
    result.push(out)
    frames.push({ phase: kind, pythonLine: { push: 7, pop: 10, top: 12, peekMax: 14, popMax: 18 }[kind], activeLine, stack: [...stack], index, result: out, message })
  }
  frames.push({ phase: 'done', pythonLine: 19, activeLine: L('return results'), stack: [...stack], index: null, result: null, message: `${result.length} operation(s) complete.` })
  return { input: ops, result, frames }
}

export const python = `def max_stack_operations(ops):
    stack = []
    result = []
    for op in ops:
        kind = op[0]
        if kind == 'push':
            stack.append(op[1])
            result.append(None)
        elif kind == 'pop':
            result.append(stack.pop())
        elif kind == 'top':
            result.append(stack[-1])
        elif kind == 'peekMax':
            result.append(max(stack))
        else:
            best = max(stack)
            index = len(stack) - 1 - stack[::-1].index(best)
            result.append(stack.pop(index))
    return result`
