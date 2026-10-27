export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Array.isArray(spec.values) || spec.values.length > 15) throw new Error('Use up to 15 values.')
  if (spec.values.some(v => !Number.isInteger(v) || Math.abs(v) > 100)) throw new Error('Values are integers from -100 to 100.')
  if (!Number.isInteger(spec.insert) || Math.abs(spec.insert) > 100) throw new Error('insert is an integer from -100 to 100.')
  const n = spec.values.length
  // A sorted cycle has at most one place where the value drops (the wrap back to the start).
  const drops = spec.values.filter((v, i) => v > spec.values[(i + 1) % n]).length
  if (n > 0 && drops > 1) throw new Error('values must already form a sorted circular list.')
  return spec
}

export function buildTrace(spec) {
  const { values, insert } = spec
  const n = values.length
  const frames = []
  if (n === 0) {
    frames.push({ phase: 'done', activeLine: L('if head is empty'), prev: null, cur: null, nodes: [], result: [insert], message: 'The list is empty: the new node points to itself.' })
    return { input: spec, result: [insert], frames, head: null }
  }
  const nodes = values.map((value, id) => ({ id, value, next: null }))
  nodes.forEach((node, i) => { node.next = nodes[(i + 1) % n] })
  const head = nodes[0]
  const order = count => {
    const out = []
    let node = head
    for (let i = 0; i < count; i++) { out.push({ id: node.id, value: node.value }); node = node.next }
    return out
  }
  let prev = head
  let pivot = null
  do {
    const cur = prev.next
    const fits = (prev.value <= insert && insert <= cur.value) || (prev.value > cur.value && (insert >= prev.value || insert <= cur.value))
    frames.push({ phase: 'scan', activeLine: L('cur = prev.next'), prev: prev.id, cur: cur.id, nodes: order(n), result: null, fits, message: fits ? `${insert} belongs between ${prev.value} and ${cur.value}.` : `${insert} does not belong between ${prev.value} and ${cur.value}; keep walking.` })
    if (fits) { pivot = prev; break }
    prev = cur
  } while (prev !== head)
  // If nothing fits, the value is a new maximum or minimum: place it after the wrap point (the head works when all values are equal).
  const at = pivot ?? head
  at.next = { id: n, value: insert, next: at.next }
  const result = order(n + 1).map(item => item.value)
  frames.push({ phase: 'insert', activeLine: L('link a new node holding insert'), prev: at.id, cur: at.next.id, nodes: order(n + 1), result: null, fits: true, message: `Insert ${insert} after ${at.value}. The head stays where it was.` })
  frames.push({ phase: 'done', activeLine: L('return head'), prev: null, cur: null, nodes: order(n + 1), result, message: `Read the cycle from the head: ${result.join(', ')}.` })
  return { input: spec, result, frames, head: head.id }
}

export const code = `insertIntoCircularList(head, insert):
  if head is empty, make a new node for insert that points to itself, and return it
  prev = head
  repeat
    cur = prev.next
    if insert fits between prev and cur in sorted order, or across the wrap, stop
    prev = cur
    if prev is head, stop
  link a new node holding insert after prev, so its next is prev's old next
  return head`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def insert_into_circular_list(values, insert):
    if not values:
        node = Node(insert)
        node.next = node
        return [insert]
    nodes = [Node(v) for v in values]
    for i, node in enumerate(nodes):
        node.next = nodes[(i + 1) % len(nodes)]
    head = nodes[0]
    prev = head
    while True:
        cur = prev.next
        if prev.val <= insert <= cur.val or (prev.val > cur.val and (insert >= prev.val or insert <= cur.val)):
            break
        prev = cur
        if prev is head:
            break
    prev.next = Node(insert, prev.next)
    result = []
    node = head
    for _ in range(len(values) + 1):
        result.append(node.val)
        node = node.next
    return result`
