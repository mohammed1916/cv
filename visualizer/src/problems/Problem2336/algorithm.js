export function parseInput(text) {
  const data = JSON.parse(text)
  const ops = data?.operations
  const args = data?.arguments
  if (!Array.isArray(ops) || !Array.isArray(args) || ops.length !== args.length || ops.length < 1 || ops.length > 12) throw new Error('Use "operations" and "arguments" arrays of the same length from 1 to 12.')
  let pops = 0
  ops.forEach((op, i) => {
    if (op === 'popSmallest') {
      if (!Array.isArray(args[i]) || args[i].length !== 0) throw new Error('popSmallest takes no arguments.')
      pops++
    } else if (op === 'addBack') {
      if (!Array.isArray(args[i]) || args[i].length !== 1 || !Number.isInteger(args[i][0]) || args[i][0] < 1 || args[i][0] > 30) throw new Error('addBack takes one integer from 1 to 30.')
    } else {
      throw new Error('Operations are "popSmallest" or "addBack".')
    }
  })
  if (pops > 40) throw new Error('Use at most 40 popSmallest calls.')
  return { operations: ops, arguments: args }
}

export function buildTrace({ operations, arguments: args }) {
  let fresh = 1
  const back = []
  const result = []
  const frames = [{ phase: 'start', activeLine: L('let fresh = 1'), pythonLine: 4, fresh, back: [], value: null, message: 'Every positive integer is in the set; the counter starts at 1.' }]
  operations.forEach((op, i) => {
    if (op === 'popSmallest') {
      let value
      if (back.length) {
        back.sort((a, b) => a - b)
        value = back.shift()
        frames.push({ phase: 'pop', activeLine: L('return heapPop(back)'), pythonLine: 10, fresh, back: [...back], value, message: `Return ${value} from the added-back heap.` })
      } else {
        value = fresh
        fresh++
        frames.push({ phase: 'pop', activeLine: L('return fresh++'), pythonLine: 12, fresh, back: [...back], value, message: `Return ${value} from the counter.` })
      }
      result.push(value)
    } else {
      const x = args[i][0]
      const added = x < fresh && !back.includes(x)
      if (added) back.push(x)
      result.push(null)
      frames.push({ phase: 'addBack', activeLine: L('heapPush(back, x)'), pythonLine: added ? 17 : 16, fresh, back: [...back], value: null, message: added ? `Add ${x} back to the heap.` : `${x} is already in the set, so nothing changes.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return out'), pythonLine: 19, fresh, back: [...back], value: null, message: 'Every operation has been answered.' })
  return { input: { operations, arguments: args }, result, frames }
}

export const code = `let fresh = 1
const back = []
function popSmallest() {
  if (back.length) return heapPop(back)
  return fresh++
}
function addBack(x) {
  if (x < fresh && !back.includes(x)) heapPush(back, x)
}
const out = []
for (let i = 0; i < operations.length; i++) {
  if (operations[i] === 'popSmallest') out.push(popSmallest())
  else { addBack(args[i][0]); out.push(null) }
}
return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def smallest_infinite_set(operations, arguments):
    fresh = 1
    back = []
    out = []
    for op, args in zip(operations, arguments):
        if op == 'popSmallest':
            if back:
                out.append(heapq.heappop(back))
            else:
                out.append(fresh)
                fresh += 1
        else:
            x = args[0]
            if x < fresh and x not in back:
                heapq.heappush(back, x)
            out.append(None)
    return out
`
