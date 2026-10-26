const OPS = ['enQueue', 'deQueue', 'Front', 'Rear', 'isEmpty', 'isFull']

export function parseInput(text) {
  const data = JSON.parse(text)
  const { k, ops } = data ?? {}
  if (!Number.isInteger(k) || k < 1 || k > 1000) throw new Error('k must be an integer from 1 to 1,000.')
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 3000) throw new Error('ops must be a list of 1–3,000 operations.')
  for (const [name, value] of ops) {
    if (!OPS.includes(name)) throw new Error(`Unknown operation ${name}.`)
    if (name === 'enQueue' && (!Number.isInteger(value) || Math.abs(value) > 1000)) throw new Error('enQueue needs an integer value with |value| ≤ 1000.')
  }
  return { k, ops }
}

// Ring buffer: head is the front slot; size counts the stored values.
export function buildTrace({ k, ops }) {
  const slots = Array(k).fill(null)
  let head = 0, size = 0
  const results = []
  const frames = [{ phase: 'start', op: -1, slots: [...slots], head, size, k, returned: undefined, activeLine: 2, message: `Create a ring buffer with ${k} slots.` }]
  ops.forEach(([name, value], op) => {
    let returned
    let phase = 'query'
    if (name === 'enQueue') {
      phase = 'write'
      if (size === k) returned = false
      else { slots[(head + size) % k] = value; size++; returned = true }
    } else if (name === 'deQueue') {
      phase = 'read'
      if (size === 0) returned = false
      else { slots[head] = null; head = (head + 1) % k; size--; returned = true }
    } else if (name === 'Front') returned = size ? slots[head] : -1
    else if (name === 'Rear') returned = size ? slots[(head + size - 1) % k] : -1
    else if (name === 'isEmpty') returned = size === 0
    else returned = size === k
    results.push(returned === undefined ? null : returned)
    frames.push({ phase, op, name, value, slots: [...slots], head, size, k, returned, activeLine: phase === 'write' ? 5 : phase === 'read' ? 8 : 11,
      message: `${name}${name === 'enQueue' ? `(${value})` : '()'} → ${String(returned)}.` })
  })
  frames.push({ phase: 'done', op: ops.length - 1, slots: [...slots], head, size, k, returned: undefined, activeLine: 13, message: `${ops.length} operations complete.` })
  return { input: { k, ops }, result: results, frames }
}

export const code = `class MyCircularQueue:
    def __init__(self, k):
        self.slots, self.head, self.size = [None] * k, 0, 0
    def enQueue(self, value):
        if self.size == len(self.slots): return False
        self.slots[(self.head + self.size) % len(self.slots)] = value
        self.size += 1
        return True
    def deQueue(self):
        if self.size == 0: return False
        self.head = (self.head + 1) % len(self.slots)
        self.size -= 1
        return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
