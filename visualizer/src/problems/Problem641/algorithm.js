export function parseInput(text) {
  const data = JSON.parse(text)
  const { k, ops } = data ?? {}
  if (!Number.isInteger(k) || k < 1 || k > 1000) throw new Error('k must be an integer from 1 to 1,000.')
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 3000) throw new Error('ops must be a list of 1–3,000 operations.')
  const names = ['insertFront', 'insertLast', 'deleteFront', 'deleteLast', 'getFront', 'getRear', 'isEmpty', 'isFull']
  for (const [name, value] of ops) {
    if (!names.includes(name)) throw new Error(`Unknown operation ${name}.`)
    if (name.startsWith('insert') && (!Number.isInteger(value) || Math.abs(value) > 1000)) throw new Error('Insert operations need an integer value with |value| ≤ 1000.')
  }
  return { k, ops }
}

// Ring buffer where both ends move: front index moves backward on insertFront.
export function buildTrace({ k, ops }) {
  const slots = Array(k).fill(null)
  let head = 0, size = 0
  const results = []
  const frames = [{ phase: 'start', op: -1, slots: [...slots], head, size, k, activeLine: 2, message: `Create a ring of ${k} slots.` }]
  ops.forEach(([name, value], op) => {
    let returned
    let phase = 'query'
    if (name === 'insertFront') {
      phase = 'write'
      if (size === k) returned = false
      else { head = (head - 1 + k) % k; slots[head] = value; size++; returned = true }
    } else if (name === 'insertLast') {
      phase = 'write'
      if (size === k) returned = false
      else { slots[(head + size) % k] = value; size++; returned = true }
    } else if (name === 'deleteFront') {
      phase = 'read'
      if (size === 0) returned = false
      else { slots[head] = null; head = (head + 1) % k; size--; returned = true }
    } else if (name === 'deleteLast') {
      phase = 'read'
      if (size === 0) returned = false
      else { slots[(head + size - 1) % k] = null; size--; returned = true }
    } else if (name === 'getFront') returned = size ? slots[head] : -1
    else if (name === 'getRear') returned = size ? slots[(head + size - 1) % k] : -1
    else if (name === 'isEmpty') returned = size === 0
    else returned = size === k
    results.push(returned === undefined ? null : returned)
    frames.push({ phase, op, name, value, slots: [...slots], head, size, k, returned, activeLine: phase === 'write' ? 5 : phase === 'read' ? 9 : 12,
      message: `${name}${name.startsWith('insert') ? `(${value})` : '()'} → ${String(returned)}.` })
  })
  frames.push({ phase: 'done', op: ops.length - 1, slots: [...slots], head, size, k, activeLine: 14, message: `${ops.length} operations complete.` })
  return { input: { k, ops }, result: results, frames }
}

export const code = `class MyCircularDeque:
    def insertFront(self, value):
        if self.size == self.k: return False
        self.head = (self.head - 1) % self.k
        self.slots[self.head] = value
        self.size += 1
        return True
    def deleteLast(self):
        if self.size == 0: return False
        self.size -= 1
        return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
