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
  const frames = [{ phase: 'start', activeLine: L('set fresh to 1'), fresh, back: [], value: null, message: 'Every positive integer is in the set; the counter starts at 1.' }]
  operations.forEach((op, i) => {
    if (op === 'popSmallest') {
      let value
      if (back.length) {
        back.sort((a, b) => a - b)
        value = back.shift()
        frames.push({ phase: 'pop', activeLine: L('return and remove its smallest'), fresh, back: [...back], value, message: `Return ${value} from the added-back heap.` })
      } else {
        value = fresh
        fresh++
        frames.push({ phase: 'pop', activeLine: L('return fresh, then add 1'), fresh, back: [...back], value, message: `Return ${value} from the counter.` })
      }
      result.push(value)
    } else {
      const x = args[i][0]
      const added = x < fresh && !back.includes(x)
      if (added) back.push(x)
      result.push(null)
      frames.push({ phase: 'addBack', activeLine: L('push x into the heap'), fresh, back: [...back], value: null, message: added ? `Add ${x} back to the heap.` : `${x} is already in the set, so nothing changes.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return the list of results'), fresh, back: [...back], value: null, message: 'Every operation has been answered.' })
  return { input: { operations, arguments: args }, result, frames }
}

export const code = `popSmallest and addBack on the infinite set of positive integers
  set fresh to 1, the next number never taken
  keep a min heap of numbers added back, all below fresh
  for each operation in order
    if the operation is popSmallest
      if the heap is not empty then return and remove its smallest number
      otherwise return fresh, then add 1 to fresh
    if the operation is addBack x
      if x is below fresh and not in the heap then push x into the heap
  return the list of results`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
