export const phases = [
  { id: 'start', label: 'Empty cache', description: 'Start with no entries: an empty key-to-node map and an empty recency list.' },
  { id: 'lookup', label: 'Look up key', description: 'Check the map first. A miss is answered at once and does not change the list.' },
  { id: 'refresh', label: 'Mark most recent', description: 'A hit or an update moves the node to the front, the most recently used end.' },
  { id: 'evict', label: 'Evict least recent', description: 'When a new key would exceed capacity, remove the node at the back of the list.' },
  { id: 'insert', label: 'Insert at front', description: 'Create a node for the new key, place it at the front, and record it in the map.' },
  { id: 'done', label: 'Complete', description: 'Return the outputs of every get, with null for put operations.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"capacity": 2, "commands": ["put"], "args": [[1, 10]]}.')
  const { capacity, commands, args } = input
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10) throw new Error('capacity is an integer from 1 to 10.')
  if (!Array.isArray(commands) || !Array.isArray(args) || commands.length !== args.length) throw new Error('commands and args must be arrays of the same length.')
  if (commands.length < 1 || commands.length > 30) throw new Error('Use 1 to 30 operations.')
  commands.forEach((command, i) => {
    const argList = args[i]
    if (!Array.isArray(argList)) throw new Error(`args[${i}] must be an array.`)
    if (command === 'put') {
      if (argList.length !== 2 || !argList.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) throw new Error(`args[${i}] for put is [key, value] with integers from 0 to 99.`)
    } else if (command === 'get') {
      if (argList.length !== 1 || !Number.isInteger(argList[0]) || argList[0] < 0 || argList[0] > 99) throw new Error(`args[${i}] for get is [key] with an integer from 0 to 99.`)
    } else throw new Error(`commands[${i}] must be "get" or "put".`)
  })
  return { capacity, commands, args }
}

// Doubly linked list with sentinels: head.next is the most recent node, tail.prev the least recent.
function makeList() {
  const head = { key: null, value: null, prev: null, next: null }
  const tail = { key: null, value: null, prev: null, next: null }
  head.next = tail
  tail.prev = head
  const unlink = node => { node.prev.next = node.next; node.next.prev = node.prev }
  const linkFront = node => { node.next = head.next; node.prev = head; head.next.prev = node; head.next = node }
  const keys = () => { const out = []; for (let n = head.next; n !== tail; n = n.next) out.push(n.key); return out }
  return { head, tail, unlink, linkFront, keys }
}

export function buildTrace({ capacity, commands, args }) {
  const nodes = new Map()
  const list = makeList()
  const outputs = []
  const frames = []
  const snap = (extra) => ({ capacity, order: list.keys(), size: nodes.size, outputs: [...outputs], ...extra })
  frames.push({ phase: 'start', activeLine: L('nodes = empty hash map'), pythonLine: P('self.nodes = {}'), snapshot: snap({ command: null, key: null }), message: `Capacity ${capacity}. The map and the recency list are empty.` })
  commands.forEach((command, step) => {
    const argList = args[step]
    const label = command === 'get' ? `get(${argList[0]})` : `put(${argList[0]}, ${argList[1]})`
    if (command === 'get') {
      const key = argList[0]
      const hit = nodes.has(key)
      frames.push({ phase: 'lookup', activeLine: L('if key not in nodes'), pythonLine: P('if key not in self.nodes'), snapshot: snap({ command, key, hit }), message: `${label}: ${hit ? 'the key is in the map.' : 'the key is not in the map, so the answer is -1.'}` })
      if (hit) {
        const node = nodes.get(key)
        list.unlink(node)
        list.linkFront(node)
        frames.push({ phase: 'refresh', activeLine: L('move nodes[key] to front'), pythonLine: P('self._move_front(node)'), snapshot: snap({ command, key, hit, value: node.value }), message: `The key was read, so it becomes the most recent entry. Value ${node.value} is returned.` })
        outputs.push(node.value)
      } else {
        outputs.push(-1)
      }
    } else {
      const [key, value] = argList
      if (nodes.has(key)) {
        const node = nodes.get(key)
        node.value = value
        list.unlink(node)
        list.linkFront(node)
        frames.push({ phase: 'refresh', activeLine: L('update its value and move it to front'), pythonLine: P('node.value = value'), snapshot: snap({ command, key, hit: true, value }), message: `${label} updates an existing key. The size stays ${nodes.size}, and the key becomes most recent.` })
      } else {
        frames.push({ phase: 'lookup', activeLine: L('if key in nodes: update'), pythonLine: P('if key in self.nodes'), snapshot: snap({ command, key, hit: false, value }), message: `${label} is a new key. The map has ${nodes.size} of ${capacity} slots in use.` })
        if (nodes.size === capacity) {
          const lru = list.tail.prev
          list.unlink(lru)
          nodes.delete(lru.key)
          frames.push({ phase: 'evict', activeLine: L('remove back node'), pythonLine: P('lru = self.tail.prev'), snapshot: snap({ command, key, evicted: lru.key }), message: `The cache is full, so key ${lru.key} at the back of the list is evicted.` })
        }
        const node = { key, value, prev: null, next: null }
        list.linkFront(node)
        nodes.set(key, node)
        frames.push({ phase: 'insert', activeLine: L('insert new node at front'), pythonLine: P('node = Node(key, value)'), snapshot: snap({ command, key, hit: false, value }), message: `Insert key ${key} at the front, the most recent position.` })
      }
      outputs.push(null)
    }
  })
  frames.push({ phase: 'done', activeLine: L('return outputs'), pythonLine: P('self.nodes[key] = node'), snapshot: snap({ command: null, key: null }), message: `Return the ${outputs.length} outputs, one per operation.` })
  return { input: { capacity, commands, args }, result: outputs, frames }
}

export const code = `LRU cache of capacity c, processed command by command:
  nodes = empty hash map; order = empty doubly linked list
  for each command:
    if command is get(key):
      if key not in nodes: output -1
      else: move nodes[key] to front; output its value
    if command is put(key, value):
      if key in nodes: update its value and move it to front
      else:
        if size == capacity: remove back node from order and nodes
        insert new node at front; nodes[key] = node
  return outputs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `class Node:
    def __init__(self, key=None, value=None):
        self.key, self.value = key, value
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.nodes = {}
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def get(self, key):
        if key not in self.nodes:
            return -1
        node = self.nodes[key]
        self._move_front(node)
        return node.value

    def put(self, key, value):
        if key in self.nodes:
            node = self.nodes[key]
            node.value = value
            self._move_front(node)
            return
        if len(self.nodes) == self.capacity:
            lru = self.tail.prev
            self._unlink(lru)
            del self.nodes[lru.key]
        node = Node(key, value)
        self._link_front(node)
        self.nodes[key] = node

    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _link_front(self, node):
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node

    def _move_front(self, node):
        self._unlink(node)
        self._link_front(node)
`
