import { createListTracker } from '../../components/shared/listPointerModel.js'

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

// Singly linked list with a sentinel head. Every operation walks `prev` from the dummy node, then rewrites next pointers.
export function buildTrace(ops) {
  const table = { dummy: { val: 'dummy', next: null } }
  let nextId = 0, size = 0
  const tracker = createListTracker()
  const values = () => { const out = []; for (let id = table.dummy.next; id !== null; id = table[id].next) out.push(table[id].val); return out }
  const log = []
  const frames = []
  const push = (phase, op, returned, activeLine, message, pointers = [], hot = []) => frames.push({
    phase, op, returned, activeLine, message, list: values(), size, log: log.map(x => ({ ...x })),
    view: tracker.snapshot(table, 'dummy', [{ label: 'dummy', nodeId: 'dummy' }, ...pointers], hot, { title: 'Nodes and next pointers', doubly: false }),
  })
  push('start', null, null, 3, 'An empty list: only the dummy sentinel exists, and dummy.next is null.')
  ops.forEach((op, i) => {
    const [name, a, b] = op
    const call = `${name}(${[a, b].filter(x => x !== undefined).join(', ')})`
    const index = name === 'addAtHead' ? 0 : name === 'addAtTail' ? size : a
    const valid = name === 'get' || name === 'deleteAtIndex' ? index >= 0 && index < size : index >= 0 && index <= size
    let returned = null
    if (name === 'get') returned = valid ? null : -1
    const entry = { name, args: name === 'addAtIndex' ? [a, b] : [a], returned: null }
    log.push(entry)
    if (!valid) {
      if (name === 'get') entry.returned = returned
      push(name === 'get' ? 'get' : 'splice', i, entry.returned, name === 'get' ? 17 : name === 'deleteAtIndex' ? 12 : 6, `${call}: index ${index} is outside the list (length ${size}), so nothing changes${name === 'get' ? ' and -1 is returned' : ''}.`, [{ label: 'prev', nodeId: 'dummy' }])
      return
    }
    // Walk prev to the node just before the target position (for get, cur lands on the target).
    let prev = 'dummy'
    push('walk', i, null, name === 'get' ? 18 : name === 'deleteAtIndex' ? 13 : 7, `${call}: prev starts at dummy; it must advance ${index} time${index === 1 ? '' : 's'} to stand just before position ${index}.`, [{ label: 'prev', nodeId: prev }])
    for (let hop = 0; hop < index; hop++) {
      prev = table[prev].next
      push('walk', i, null, name === 'get' ? 19 : name === 'deleteAtIndex' ? 14 : 8, `prev = prev.next moves to node ${prev} (value ${table[prev].val}), hop ${hop + 1} of ${index}.`, [{ label: 'prev', nodeId: prev }])
    }
    if (name === 'get') {
      const cur = table[prev].next
      entry.returned = table[cur].val
      push('get', i, entry.returned, 20, `${call}: cur = prev.next is node ${cur}; return its value ${entry.returned}.`, [{ label: 'prev', nodeId: prev }, { label: 'cur', nodeId: cur }], [cur])
    } else if (name === 'deleteAtIndex') {
      const doomed = table[prev].next
      push('splice', i, null, 15, `${call}: doomed = prev.next is node ${doomed} (value ${table[doomed].val}).`, [{ label: 'prev', nodeId: prev }, { label: 'doomed', nodeId: doomed }], [doomed])
      table[prev].next = table[doomed].next
      size -= 1
      push('splice', i, null, 15, `prev.next = doomed.next: node ${prev === 'dummy' ? 'dummy' : prev} now skips node ${doomed}, which is detached from the list.`, [{ label: 'prev', nodeId: prev }, { label: 'doomed', nodeId: doomed }], [prev])
    } else {
      const value = name === 'addAtIndex' ? b : a
      const fresh = nextId++
      table[fresh] = { val: value, next: null }
      push('splice', i, null, 9, `${call}: create node ${fresh} (value ${value}); it is not linked yet, so it appears detached with next = null.`, [{ label: 'prev', nodeId: prev }, { label: 'new', nodeId: fresh }], [fresh])
      table[fresh].next = table[prev].next
      push('splice', i, null, 9, `new.next = prev.next: the new node points at what prev used to point at (${table[fresh].next === null ? 'null' : `node ${table[fresh].next}`}).`, [{ label: 'prev', nodeId: prev }, { label: 'new', nodeId: fresh }], [fresh])
      table[prev].next = fresh
      size += 1
      push('splice', i, null, 10, `prev.next = new: node ${prev} now points at node ${fresh}, completing the splice. Length is ${size}.`, [{ label: 'prev', nodeId: prev }, { label: 'new', nodeId: fresh }], [fresh])
    }
  })
  push('done', ops.length - 1, null, 20, `Final list: [${values().join(', ')}].`)
  const final = frames.at(-1)
  final.log = log
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
        self.size += 1
    def deleteAtIndex(self, index):
        if index >= self.size: return
        prev = self.head
        for _ in range(index): prev = prev.next
        prev.next = prev.next.next
        self.size -= 1
    def get(self, index):
        if index >= self.size: return -1
        cur = self.head.next
        for _ in range(index): cur = cur.next
        return cur.val`.split('\n').map((text, index) => ({ line: index + 1, text }))
