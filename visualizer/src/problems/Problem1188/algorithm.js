export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.capacity) || input.capacity < 1 || input.capacity > 5) throw new Error('capacity is an integer from 1 to 5.')
  if (!Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 20) throw new Error('ops is a list of 1 to 20 calls.')
  for (const op of input.ops) {
    if (op[0] === 'enqueue' && Number.isInteger(op[1])) continue
    if (op[0] === 'dequeue' && op.length === 1) continue
    throw new Error('Use ["enqueue", value] or ["dequeue"].')
  }
  return input
}

export function buildTrace({ capacity, ops }) {
  const items = []
  const results = []
  const frames = [{ phase: 'start', pythonLine: PL('items = deque()'), activeLine: L('start with an empty queue'), state: [], message: `Capacity is ${capacity}.` }]
  for (const op of ops) {
    if (op[0] === 'enqueue') {
      if (items.length === capacity) {
        results.push('blocked')
        frames.push({ phase: 'blocked', pythonLine: PL('results.append("blocked")'), activeLine: L('if the queue is full'), state: [...items], message: `enqueue ${op[1]} waits: the queue is full.` })
      } else {
        items.push(op[1])
        frames.push({ phase: 'enqueue', pythonLine: PL('items.append(op[1])'), activeLine: L('add the value'), state: [...items], message: `Add ${op[1]} to the back.` })
      }
    } else if (items.length === 0) {
      results.push('blocked')
      frames.push({ phase: 'blocked', pythonLine: PL('results.append("blocked")'), activeLine: L('if the queue is empty'), state: [], message: 'dequeue waits: the queue is empty.' })
    } else {
      const front = items.shift()
      results.push(front)
      frames.push({ phase: 'dequeue', pythonLine: PL('results.append(items.popleft())'), activeLine: L('remove the front value'), state: [...items], message: `Remove ${front} from the front.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: PL('return results'), activeLine: L('return every result'), state: [...items], message: 'The schedule is finished.' })
  return { input: { capacity, ops }, result: results, frames }
}

export const code = `bounded queue replay with a fixed capacity
  start with an empty queue
  for each call in the schedule
    if the call is enqueue
      if the queue is full then mark the call as waiting
      otherwise add the value at the back
    otherwise
      if the queue is empty then mark the call as waiting
      otherwise remove the front value
  return every result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def replay(capacity, ops):
    items = deque()
    results = []
    for op in ops:
        if op[0] == "enqueue":
            if len(items) == capacity:
                results.append("blocked")
                continue
            items.append(op[1])
        else:
            if not items:
                results.append("blocked")
                continue
            results.append(items.popleft())
    return results
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
