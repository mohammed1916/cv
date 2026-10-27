export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.max_size) || !Array.isArray(obj.operations)) throw new Error('Use an object with max_size and an operations array.')
  const { max_size, operations } = obj
  if (max_size < 1 || max_size > 8) throw new Error('max_size is an integer from 1 to 8 in this visualization.')
  if (operations.length < 1 || operations.length > 20) throw new Error('operations needs 1 to 20 entries.')
  for (const op of operations) {
    if (!Array.isArray(op)) throw new Error('Each operation is an array such as ["push", 3], ["pop"] or ["increment", 2, 5].')
    const [name, a, b] = op
    if (name === 'push') { if (op.length !== 2 || !Number.isInteger(a) || a < 1 || a > 100) throw new Error('push takes one integer from 1 to 100.') }
    else if (name === 'pop') { if (op.length !== 1) throw new Error('pop takes no arguments.') }
    else if (name === 'increment') { if (op.length !== 3 || !Number.isInteger(a) || a < 0 || a > 10 || !Number.isInteger(b) || b < 1 || b > 100) throw new Error('increment takes k from 0 to 10 and val from 1 to 100.') }
    else throw new Error(`Unknown operation ${name}.`)
  }
  return { max_size, operations }
}

export function buildTrace(input) {
  const { max_size, operations } = input
  const values = []
  const adds = []
  const results = []
  const ops = []
  const snapshot = () => {
    const out = new Array(values.length)
    let acc = 0
    for (let i = values.length - 1; i >= 0; i--) {
      acc += adds[i]
      out[i] = values[i] + acc
    }
    return out
  }
  const frames = [{ phase: 'start', activeLine: L('set values and adds to empty lists'), op: -1, stack: [], message: `Create an empty stack that holds at most ${max_size} values.` }]
  operations.forEach((op, idx) => {
    const [name, a, b] = op
    let returned
    if (name === 'push') {
      if (values.length < max_size) {
        values.push(a)
        adds.push(0)
        frames.push({ phase: 'push', activeLine: L('push the value with an add of 0'), op: idx, stack: snapshot(), message: `push(${a}) puts ${a} on top.` })
      } else {
        frames.push({ phase: 'push', activeLine: L('for each operation'), op: idx, stack: snapshot(), message: `The stack is full, so push(${a}) does nothing.` })
      }
    } else if (name === 'pop') {
      if (values.length === 0) {
        returned = -1
        frames.push({ phase: 'pop', activeLine: L('append -1 to results'), op: idx, stack: snapshot(), message: 'The stack is empty, so pop returns -1.' })
      } else {
        const extra = adds.pop()
        if (adds.length) adds[adds.length - 1] += extra
        returned = values.pop() + extra
        frames.push({ phase: 'pop', activeLine: L('pass its add down'), op: idx, stack: snapshot(), message: `pop returns ${returned}, including its pending increments.` })
      }
    } else {
      const m = Math.min(a, values.length)
      if (m > 0) adds[m - 1] += b
      frames.push({ phase: 'increment', activeLine: L('add val to the add'), op: idx, stack: snapshot(), message: m > 0 ? `Add ${b} to the bottom ${m} value(s).` : 'The stack is empty, so nothing changes.' })
    }
    if (name === 'pop') results.push(returned)
    ops.push({ name, args: op.slice(1), returned })
  })
  frames.push({ phase: 'done', activeLine: L('return results'), op: operations.length, stack: snapshot(), message: `Pop results: ${results.join(', ') || 'none'}.` })
  return { input, result: results, ops, frames }
}

export const code = `design a stack with increment
  set values and adds to empty lists
  set results to an empty list
  for each operation do
    if it is push and the stack is not full then
      push the value with an add of 0
    otherwise if it is pop then
      if the stack is empty then append -1 to results
      otherwise pop the top and pass its add down to the value below
    otherwise if it is increment(k, val) then
      add val to the add of the element min(k, size) minus 1
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def custom_stack(max_size, operations):
    values = []
    adds = []
    results = []
    for op in operations:
        name = op[0]
        if name == "push":
            if len(values) < max_size:
                values.append(op[1])
                adds.append(0)
        elif name == "pop":
            if not values:
                results.append(-1)
            else:
                extra = adds.pop()
                if adds:
                    adds[-1] += extra
                results.append(values.pop() + extra)
        elif name == "increment":
            m = min(op[1], len(values))
            if m > 0:
                adds[m - 1] += op[2]
    return results
`
