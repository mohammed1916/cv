export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with list1, a, b and list2.')
  const { list1, a, b, list2 } = input
  if (!Array.isArray(list1) || list1.length < 3 || list1.length > 10 || list1.some(v => !Number.isInteger(v) || v < 0 || v > 99)) throw new Error('list1 has 3 to 10 integers from 0 to 99.')
  if (!Array.isArray(list2) || list2.length < 1 || list2.length > 5 || list2.some(v => !Number.isInteger(v) || v < 0 || v > 99)) throw new Error('list2 has 1 to 5 integers from 0 to 99.')
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || a > b || b > list1.length - 2) throw new Error('Use integers with 1 <= a <= b <= length of list1 - 2.')
  return { list1, a, b, list2 }
}

export function buildTrace({ list1, a, b, list2 }) {
  const make = (values, tag) => {
    let head = null
    let prev = null
    values.forEach((v, i) => {
      const node = { id: `${tag}${i}`, value: v, next: null }
      if (prev) prev.next = node
      else head = node
      prev = node
    })
    return head
  }
  const head1 = make(list1, 'a')
  const head2 = make(list2, 'b')
  const walk = head => {
    const out = []
    for (let c = head; c; c = c.next) out.push({ id: c.id, value: c.value })
    return out
  }
  const frames = [{ phase: 'start', activeLine: L('merge list2'), nodes: walk(head1), pointers: [], removed: [], message: `Remove list1 from index ${a} to ${b} and insert list2 there.` }]
  let left = head1
  for (let i = 1; i < a; i++) left = left.next
  let right = left
  for (let i = 0; i <= b - a; i++) right = right.next
  const removed = []
  for (let c = left.next; c !== right.next; c = c.next) removed.push(c.id)
  frames.push({ phase: 'locate', activeLine: L('walk to node a - 1'), nodes: walk(head1), pointers: [{ label: 'left', id: left.id }, { label: 'right', id: right.id }], removed, message: `left is index ${a - 1} and right is index ${b}. Nodes ${a} to ${b} will go.` })
  let tail = head2
  while (tail.next) tail = tail.next
  left.next = head2
  tail.next = right.next
  frames.push({ phase: 'splice', activeLine: L('set tail.next'), nodes: walk(head1), pointers: [{ label: 'left', id: left.id }], removed: [], message: 'list2 is spliced in after left, and its tail points past the removed nodes.' })
  const result = walk(head1).map(node => node.value)
  frames.push({ phase: 'done', activeLine: L('return the values'), nodes: walk(head1), pointers: [], removed: [], message: `Merged list: [${result.join(', ')}].` })
  return { input: { list1, a, b, list2 }, result, frames }
}

export const code = `merge list2 into list1, replacing the nodes from index a to b
walk to node a - 1 and call it left
walk on to node b and call it right
find the last node of list2 and call it tail
set left.next to the first node of list2
set tail.next to right.next, which drops the removed nodes
return the values of list1 from its head`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class ListNode:
    def __init__(self, val, nxt=None):
        self.val = val
        self.next = nxt

def merge_in_between(list1, a, b, list2):
    head1 = None
    for v in reversed(list1):
        head1 = ListNode(v, head1)
    head2 = None
    for v in reversed(list2):
        head2 = ListNode(v, head2)
    left = head1
    for _ in range(a - 1):
        left = left.next
    right = left
    for _ in range(b - a + 1):
        right = right.next
    tail = head2
    while tail.next is not None:
        tail = tail.next
    left.next = head2
    tail.next = right.next
    out = []
    cur = head1
    while cur is not None:
        out.append(cur.val)
        cur = cur.next
    return out
`
