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

// A blocked call is parked, not dropped: a full queue parks enqueues in arrival order, an empty queue parks dequeues.
// Each finished call frees room or supplies a value for the oldest parked call of the other kind.
export function buildTrace({ capacity, ops }) {
  const items = []
  const parkedEnq = []
  const parkedDeq = []
  const results = ops.map(() => null)
  let current = null
  const snap = () => ({ items: [...items], parkedEnq: parkedEnq.map(p => p.value), parkedEnqCalls: parkedEnq.map(p => p.call), parkedDeq: [...parkedDeq], call: current })
  const frames = [{ phase: 'start', pythonLine: PL('items = deque()'), activeLine: L('const items = []'), state: [], ...snap(), message: `Capacity is ${capacity}.` }]
  const push = (phase, key, pyKey, message) => frames.push({ phase, pythonLine: PL(pyKey), activeLine: L(key), state: [...items], ...snap(), message })
  ops.forEach((op, call) => {
    current = call
    const label = `call ${call + 1}`
    if (op[0] === 'enqueue') {
      if (parkedDeq.length && items.length === 0) {
        const waiter = parkedDeq.shift()
        results[waiter] = op[1]
        push('enqueue', 'results[parkedDeq.shift()]', 'results[parked_deq.popleft()]', `${label}: enqueue ${op[1]} goes straight to the oldest waiting dequeue, which returns ${op[1]}.`)
      } else if (items.length < capacity) {
        items.push(op[1])
        push('enqueue', 'items.push(op[1])', 'items.append(op[1])', `${label}: add ${op[1]} to the back.`)
      } else {
        parkedEnq.push({ call, value: op[1] })
        push('blocked', 'parkedEnq.push', 'parked_enq.append', `${label}: enqueue ${op[1]} waits because the queue is full.`)
      }
    } else if (items.length === 0) {
      parkedDeq.push(call)
      push('blocked', 'parkedDeq.push(call)', 'parked_deq.append', `${label}: dequeue waits because the queue is empty.`)
    } else {
      const front = items.shift()
      results[call] = front
      push('dequeue', 'results[call] = items.shift()', 'results[call] = items.popleft()', `${label}: remove ${front} from the front.`)
      if (parkedEnq.length) {
        const waiter = parkedEnq.shift()
        items.push(waiter.value)
        push('enqueue', 'items.push(parkedEnq.shift().value)','items.append(parked_enq.popleft()[1])', `The room frees the oldest waiting enqueue, which adds ${waiter.value} at the back.`)
      }
    }
  })
  for (const call of parkedDeq) results[call] = 'waiting'
  current = null
  frames.push({ phase: 'done', pythonLine: PL('return results'), activeLine: L('return results'), state: [...items], ...snap(), message: 'The schedule is finished. Calls still waiting at the end are marked waiting.' })
  return { input: { capacity, ops }, result: results, frames }
}

export const code = [
  'function replay(capacity, ops) {',
  '  const items = []',
  '  const parkedEnq = []',
  '  const parkedDeq = []',
  '  const results = ops.map(() => null)',
  '  ops.forEach((op, call) => {',
  "    if (op[0] === 'enqueue') {",
  '      if (parkedDeq.length && items.length === 0) {',
  '        results[parkedDeq.shift()] = op[1]',
  '      } else if (items.length < capacity) {',
  '        items.push(op[1])',
  '      } else {',
  '        parkedEnq.push({ call, value: op[1] })',
  '      }',
  '    } else if (items.length === 0) {',
  '      parkedDeq.push(call)',
  '    } else {',
  '      results[call] = items.shift()',
  '      if (parkedEnq.length) items.push(parkedEnq.shift().value)',
  '    }',
  '  })',
  "  parkedDeq.forEach(call => { results[call] = 'waiting' })",
  '  return results',
  '}',
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def replay(capacity, ops):
    items = deque()
    parked_enq = deque()
    parked_deq = deque()
    results = [None] * len(ops)
    for call, op in enumerate(ops):
        if op[0] == "enqueue":
            if parked_deq and not items:
                results[parked_deq.popleft()] = op[1]
            elif len(items) < capacity:
                items.append(op[1])
            else:
                parked_enq.append((call, op[1]))
        else:
            if not items:
                parked_deq.append(call)
                continue
            results[call] = items.popleft()
            if parked_enq:
                items.append(parked_enq.popleft()[1])
    for call in parked_deq:
        results[call] = "waiting"
    return results
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
