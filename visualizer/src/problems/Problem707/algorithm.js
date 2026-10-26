export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 300) throw new Error('Enter 1–300 operations: ["get", i], ["addAtHead", v], ["addAtTail", v], ["addAtIndex", i, v] or ["deleteAtIndex", i].')
  for (const op of ops) {
    const [name, a, b] = op
    if (!['get', 'addAtHead', 'addAtTail', 'addAtIndex', 'deleteAtIndex'].includes(name)) throw new Error(`Unknown operation ${name}.`)
    if (name === 'addAtIndex') { if (!Number.isInteger(a) || !Number.isInteger(b) || Math.abs(b) > 1000) throw new Error('addAtIndex needs an integer index and an integer value.') }
    else if (name === 'addAtHead' || name === 'addAtTail') { if (!Number.isInteger(a) || Math.abs(a) > 1000) throw new Error('Values are integers with |v| ≤ 1000.') }
    else if (!Number.isInteger(a)) throw new Error('Indices are integers.')
  }
  return ops
}

// Singly linked list with a sentinel head. Each step walks to the target position, then splices.
export function buildTrace(ops) {
  let list = []
  const log = []
  const frames = [{ phase: 'start', list: [], op: null, activeLine: 2, message: 'An empty list.' }]
  ops.forEach((op, i) => {
    const [name, a, b] = op
    let returned = null
    if (name === 'addAtHead') list = [a, ...list]
    else if (name === 'addAtTail') list = [...list, a]
    else if (name === 'addAtIndex') { if (a >= 0 && a <= list.length) list = [...list.slice(0, a), b, ...list.slice(a)] }
    else if (name === 'deleteAtIndex') { if (a >= 0 && a < list.length) list = [...list.slice(0, a), ...list.slice(a + 1)] }
    else returned = a >= 0 && a < list.length ? list[a] : -1
    log.push({ name, args: name === 'addAtIndex' ? [a, b] : [a], returned })
    frames.push({ phase: name === 'get' ? 'get' : 'splice', list: [...list], op: i, returned, log: log.map(x => ({ ...x })), activeLine: name === 'get' ? 9 : 5, message: `${name}(${[a, b].filter(x => x !== undefined).join(', ')})${returned === null ? '' : ` → ${returned}`}; list length ${list.length}.` })
  })
  frames.push({ phase: 'done', list: [...list], op: ops.length - 1, log, activeLine: 12, message: `Final list: [${list.join(', ')}].` })
  return { input: ops, result: log.filter(x => x.name === 'get').map(x => x.returned), log, frames }
}

export const code = `class MyLinkedList:
    def __init__(self):
        self.head = Node(0)  # sentinel
        self.size = 0
    def addAtIndex(self, index, val):
        if index > self.size: return
        prev = self.head
        for _ in range(index): prev = prev.next
        prev.next = Node(val, prev.next)
        self.size += 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
