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

export const code = `MyLinkedList():
  dummy = sentinel node whose next is null
  size = 0
runOperation(name, index, value):
  index is 0 for addAtHead, size for addAtTail, or the given index
  if name is get or deleteAtIndex, require 0 <= index < size
  otherwise require 0 <= index <= size
  if the index is invalid, change nothing and return -1 for get
  prev = dummy
  walk prev forward index times
  if name is get, cur = prev.next and return cur.value
  if name is deleteAtIndex, doomed = prev.next
    then prev.next = doomed.next and size -= 1
  otherwise, new = node with value
    new.next = prev.next
    prev.next = new and size += 1
  return the list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Singly linked list with a sentinel head. Every operation walks `prev` from the dummy node, then rewrites next pointers.
export function buildTrace(ops) {
  const table = { dummy: { val: 'dummy', next: null } }
  let nextId = 0, size = 0
  const tracker = createListTracker()
  const values = () => { const out = []; for (let id = table.dummy.next; id !== null; id = table[id].next) out.push(table[id].val); return out }
  const log = []
  const frames = []
  const push = (phase, op, returned, activeLine, message, pointers = [], hot = [], pythonLine = 0) => frames.push({
    phase, op, returned, activeLine, message, pythonLine, list: values(), size, log: log.map(x => ({ ...x })),
    view: tracker.snapshot(table, 'dummy', [{ label: 'dummy', nodeId: 'dummy' }, ...pointers], hot, { title: 'Nodes and next pointers', doubly: false }),
  })
  push('start', null, null, L('dummy = sentinel node'), 'An empty list: only the dummy sentinel exists, and dummy.next is null.', [], [], 8)
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
      push(name === 'get' ? 'get' : 'splice', i, entry.returned, L('if the index is invalid'), `${call}: index ${index} is outside the list (length ${size}), so nothing changes${name === 'get' ? ' and -1 is returned' : ''}.`, [{ label: 'prev', nodeId: 'dummy' }], [], name === 'get' ? 13 : name === 'deleteAtIndex' ? 30 : 21)
      return
    }
    // Walk prev to the node just before the target position (for get, cur lands on the target).
    let prev = 'dummy'
    push('walk', i, null, L('prev = dummy'), `${call}: prev starts at dummy; it must advance ${index} time${index === 1 ? '' : 's'} to stand just before position ${index}.`, [{ label: 'prev', nodeId: prev }], [], name === 'get' ? 14 : name === 'deleteAtIndex' ? 31 : 22)
    for (let hop = 0; hop < index; hop++) {
      prev = table[prev].next
      push('walk', i, null, L('walk prev forward index times'), `prev = prev.next moves to node ${prev} (value ${table[prev].val}), hop ${hop + 1} of ${index}.`, [{ label: 'prev', nodeId: prev }], [], name === 'get' ? 16 : name === 'deleteAtIndex' ? 33 : 24)
    }
    if (name === 'get') {
      const cur = table[prev].next
      entry.returned = table[cur].val
      push('get', i, entry.returned, L('return cur.value'), `${call}: cur = prev.next is node ${cur}; return its value ${entry.returned}.`, [{ label: 'prev', nodeId: prev }, { label: 'cur', nodeId: cur }], [cur], 17)
    } else if (name === 'deleteAtIndex') {
      const doomed = table[prev].next
      push('splice', i, null, L('doomed = prev.next'), `${call}: doomed = prev.next is node ${doomed} (value ${table[doomed].val}).`, [{ label: 'prev', nodeId: prev }, { label: 'doomed', nodeId: doomed }], [doomed], 34)
      table[prev].next = table[doomed].next
      size -= 1
      push('splice', i, null, L('then prev.next = doomed.next'), `prev.next = doomed.next: node ${prev === 'dummy' ? 'dummy' : prev} now skips node ${doomed}, which is detached from the list.`, [{ label: 'prev', nodeId: prev }, { label: 'doomed', nodeId: doomed }], [prev], 34)
    } else {
      const value = name === 'addAtIndex' ? b : a
      const fresh = nextId++
      table[fresh] = { val: value, next: null }
      push('splice', i, null, L('otherwise, new = node with value'), `${call}: create node ${fresh} (value ${value}); it is not linked yet, so it appears detached with next = null.`, [{ label: 'prev', nodeId: prev }, { label: 'new', nodeId: fresh }], [fresh], 25)
      table[fresh].next = table[prev].next
      push('splice', i, null, L('new.next = prev.next'), `new.next = prev.next: the new node points at what prev used to point at (${table[fresh].next === null ? 'null' : `node ${table[fresh].next}`}).`, [{ label: 'prev', nodeId: prev }, { label: 'new', nodeId: fresh }], [fresh], 25)
      table[prev].next = fresh
      size += 1
      push('splice', i, null, L('prev.next = new and size += 1'), `prev.next = new: node ${prev} now points at node ${fresh}, completing the splice. Length is ${size}.`, [{ label: 'prev', nodeId: prev }, { label: 'new', nodeId: fresh }], [fresh], 26)
    }
  })
  push('done', ops.length - 1, null, L('return the list'), `Final list: [${values().join(', ')}].`, [], [], 52)
  const final = frames.at(-1)
  final.log = log
  return { input: ops, result: log.filter(x => x.name === 'get').map(x => x.returned), log, frames }
}

export const python = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class MyLinkedList:
    def __init__(self):
        self.dummy = ListNode(0)
        self.size = 0

    def get(self, index):
        if index < 0 or index >= self.size:
            return -1
        cur = self.dummy.next
        for _ in range(index):
            cur = cur.next
        return cur.val

    def add_at_index(self, index, val):
        if index < 0 or index > self.size:
            return
        prev = self.dummy
        for _ in range(index):
            prev = prev.next
        prev.next = ListNode(val, prev.next)
        self.size += 1

    def delete_at_index(self, index):
        if index < 0 or index >= self.size:
            return
        prev = self.dummy
        for _ in range(index):
            prev = prev.next
        prev.next = prev.next.next
        self.size -= 1

def linked_list_operations(ops):
    lst = MyLinkedList()
    results = []
    for op in ops:
        name = op[0]
        if name == 'get':
            results.append(lst.get(op[1]))
        elif name == 'addAtHead':
            lst.add_at_index(0, op[1])
        elif name == 'addAtTail':
            lst.add_at_index(lst.size, op[1])
        elif name == 'addAtIndex':
            lst.add_at_index(op[1], op[2])
        else:
            lst.delete_at_index(op[1])
    return results`
