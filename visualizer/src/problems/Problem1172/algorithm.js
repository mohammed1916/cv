export function parseInput(text) {
  const data = JSON.parse(text)
  const capacity = data?.capacity
  const ops = data?.operations
  const args = data?.arguments
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 3) throw new Error('"capacity" is an integer from 1 to 3 in this visualization.')
  if (!Array.isArray(ops) || !Array.isArray(args) || ops.length !== args.length || ops.length < 1 || ops.length > 15) throw new Error('Use "operations" and "arguments" arrays of the same length from 1 to 15.')
  ops.forEach((op, i) => {
    const a = args[i]
    if (op === 'push') {
      if (!Array.isArray(a) || a.length !== 1 || !Number.isInteger(a[0]) || a[0] < 1 || a[0] > 30) throw new Error('push takes one value from 1 to 30.')
    } else if (op === 'pop') {
      if (!Array.isArray(a) || a.length !== 0) throw new Error('pop takes no arguments.')
    } else if (op === 'popAtStack') {
      if (!Array.isArray(a) || a.length !== 1 || !Number.isInteger(a[0]) || a[0] < 0 || a[0] > 5) throw new Error('popAtStack takes an index from 0 to 5.')
    } else {
      throw new Error('Operations are push, pop, or popAtStack.')
    }
  })
  return { capacity, operations: ops, arguments: args }
}

export function buildTrace({ capacity, operations, arguments: args }) {
  const stacks = []
  const room = new Set()
  const result = []
  const frames = [{ phase: 'start', activeLine: L('set stacks to an empty list'), stacks: [], picked: -1, message: `Each stack holds ${capacity}.` }]
  const lowestRoom = () => {
    for (const i of [...room]) if (i >= stacks.length || stacks[i].length >= capacity) room.delete(i)
    return room.size ? Math.min(...room) : -1
  }
  operations.forEach((op, i) => {
    let answer = null
    let picked = -1
    if (op === 'push') {
      let s = lowestRoom()
      if (s === -1) { stacks.push([]); s = stacks.length - 1; room.add(s) }
      stacks[s].push(args[i][0])
      if (stacks[s].length === capacity) room.delete(s)
      picked = s
      frames.push({ phase: 'push', activeLine: L('use the lowest index with room'), stacks: stacks.map(x => [...x]), picked, message: `Push ${args[i][0]} onto stack ${s}.` })
    } else if (op === 'pop') {
      while (stacks.length && stacks[stacks.length - 1].length === 0) stacks.pop()
      if (stacks.length === 0) {
        answer = -1
      } else {
        const s = stacks.length - 1
        answer = stacks[s].pop()
        room.add(s)
        picked = s
      }
      frames.push({ phase: 'pop', activeLine: L('pop from the rightmost stack'), stacks: stacks.map(x => [...x]), picked, message: `pop returns ${answer}.` })
    } else {
      const s = args[i][0]
      if (s >= stacks.length || stacks[s].length === 0) {
        answer = -1
      } else {
        answer = stacks[s].pop()
        room.add(s)
        picked = s
      }
      frames.push({ phase: 'popAtStack', activeLine: L('pop from that stack'), stacks: stacks.map(x => [...x]), picked, message: `popAtStack ${s} returns ${answer}.` })
    }
    result.push(answer)
  })
  frames.push({ phase: 'done', activeLine: L('return the results'), stacks: stacks.map(x => [...x]), picked: -1, message: 'All operations are answered.' })
  return { input: { capacity, operations, arguments: args }, result, frames }
}

export const code = `dinner plate stacks, each holding at most capacity values
  set stacks to an empty list, and keep a min heap of indices of stacks that have room
  for each operation in order
    if it is push value then use the lowest index with room, or a new stack, and push the value
    if it is pop then remove empty stacks from the right, then pop from the rightmost stack
    if it is popAtStack index then pop from that stack if it has a value, otherwise answer -1
    when a stack gains room, add its index to the heap
  return the results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def dinner_plates(capacity, operations, arguments):
    stacks = []
    room = []
    out = []
    for op, args in zip(operations, arguments):
        if op == 'push':
            while room and (room[0] >= len(stacks) or len(stacks[room[0]]) == capacity):
                heapq.heappop(room)
            if not room:
                stacks.append([])
                heapq.heappush(room, len(stacks) - 1)
            s = room[0]
            stacks[s].append(args[0])
            if len(stacks[s]) == capacity:
                heapq.heappop(room)
            out.append(None)
        elif op == 'pop':
            while stacks and not stacks[-1]:
                stacks.pop()
            if not stacks:
                out.append(-1)
            else:
                s = len(stacks) - 1
                out.append(stacks[s].pop())
                if len(stacks[s]) == capacity - 1:
                    heapq.heappush(room, s)
        else:
            s = args[0]
            if s >= len(stacks) or not stacks[s]:
                out.append(-1)
            else:
                out.append(stacks[s].pop())
                if len(stacks[s]) == capacity - 1:
                    heapq.heappush(room, s)
    return out
`
