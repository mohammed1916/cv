// Pseudocode lines are looked up by a phrase, so a renamed line fails loudly instead of pointing at the wrong text.
export const code = `function splitCircularList(head) {
  let n = 1; // count the nodes n by walking from head
  for (let node = head.next; node !== head; node = node.next) n++;
  const half = Math.ceil(n / 2); // set half to ceil(n / 2)
  let last = head; // set last to head
  for (let i = 0; i < half - 1; i++) last = last.next; // walk last forward half minus 1 times
  const second = last.next; // set second to the node after last
  last.next = head; // point last back to head to close the first list
  if (second === head) return [head, null]; // if second is head then the second list is empty
  let tail = second; // walk from second to the tail
  while (tail.next !== head) tail = tail.next;
  tail.next = second; // point the tail to second to close the second list
  return [head, second]; // return both lists
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = phrase => {
  const found = code.findIndex(c => c.text.includes(phrase))
  if (found < 0) throw new Error(`Missing pseudocode line for "${phrase}"`)
  return found + 1
}

export const python = `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def make_circular(values):
    nodes = [Node(v) for v in values]
    for i, node in enumerate(nodes):
        node.next = nodes[(i + 1) % len(nodes)]
    return nodes[0]

def split_circular(head):
    n = 1
    node = head.next
    while node is not head:
        n += 1
        node = node.next
    half = (n + 1) // 2
    last = head
    for _ in range(half - 1):
        last = last.next
    second = last.next
    last.next = head
    if second is head:
        return head, None
    tail = second
    while tail.next is not head:
        tail = tail.next
    tail.next = second
    return head, second

def to_list(start):
    if start is None:
        return []
    out = [start.val]
    node = start.next
    while node is not start:
        out.append(node.val)
        node = node.next
    return out
`

const pythonLines = python.trim().split('\n')
const PY = phrase => {
  const found = pythonLines.findIndex(t => t.includes(phrase))
  if (found < 0) throw new Error(`Missing Python line for "${phrase}"`)
  return found + 1
}

export const phases = [
  { id: 'count', label: 'Count', description: 'Walk the circle once to count the nodes.' },
  { id: 'half', label: 'Half', description: 'Decide how many nodes the first list keeps.' },
  { id: 'cut-walk', label: 'Walk to cut', description: 'Move last forward to the last node of the first half.' },
  { id: 'cut', label: 'Cut', description: 'Close the first list and start the second list after it.' },
  { id: 'empty', label: 'Empty', description: 'With a single node, the second list is empty.' },
  { id: 'tail-walk', label: 'Find tail', description: 'Walk the second list to its last node.' },
  { id: 'link', label: 'Close', description: 'Point the tail back to the second head.' },
  { id: 'done', label: 'Result', description: 'Report both circular lists.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with values.')
  const { values } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 12) throw new Error('values holds 1 to 12 numbers.')
  if (!values.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) throw new Error('Each value is an integer from 0 to 99.')
  return { values: [...values] }
}

export function buildTrace({ values }) {
  const n = values.length
  const next = values.map((_, i) => (i + 1) % n)
  const frames = []
  const push = (phase, line, py, message, s = {}) => frames.push({
    phase,
    activeLine: L(line),
    pythonLine: PY(py),
    message,
    values: [...values],
    next: [...next],
    count: s.count ?? 0,
    half: s.half ?? 0,
    cursor: s.cursor ?? -1,
    last: s.last ?? -1,
    second: s.second ?? -1,
    tail: s.tail ?? -1,
  })

  push('count', 'count the nodes n by walking', 'n = 1', `Start the count at the head, value ${values[0]}.`, { count: 1, cursor: 0 })
  let count = 1
  let node = next[0]
  while (node !== 0) {
    count += 1
    push('count', 'count the nodes n by walking', 'n += 1', `Step to value ${values[node]}; the count is ${count}.`, { count, cursor: node })
    node = next[node]
  }
  const half = Math.ceil(n / 2)
  push('half', 'set half to ceil', 'half = (n + 1) // 2', `${n} node${n === 1 ? '' : 's'} split into ${half} for the first list and ${n - half} for the second.`, { count, half })
  let last = 0
  push('cut-walk', 'set last to head', 'last = head', `last starts at the head, value ${values[0]}.`, { count, half, last })
  for (let step = 0; step < half - 1; step++) {
    last = next[last]
    const remaining = half - 2 - step
    push('cut-walk', 'walk last forward half minus 1', 'last = last.next', `Move last to value ${values[last]}; ${remaining} more step${remaining === 1 ? '' : 's'} to go.`, { count, half, last })
  }
  const second = next[last]
  next[last] = 0
  push('cut', 'set second to the node after last', 'second = last.next', `Second starts at value ${values[second]}. Last now points back to the head, closing the first list.`, { count, half, last, second })
  if (second === 0) {
    push('empty', 'if second is head then the second list is empty', 'if second is head', 'The first list took every node, so the second list is empty.', { count, half, last, second })
    push('done', 'return both lists', 'return head, None', 'First list holds all values; second list is empty.', { count, half, last, second })
    return { input: { values: [...values] }, result: [[...values], []], frames }
  }
  let tail = second
  push('tail-walk', 'walk from second to the tail', 'tail = second', `Start at value ${values[tail]} to find the tail of the second list.`, { count, half, last, second, tail })
  while (next[tail] !== 0) {
    tail = next[tail]
    push('tail-walk', 'walk from second to the tail', 'tail = tail.next', `Step to value ${values[tail]}; its next still points to the head.`, { count, half, last, second, tail })
  }
  next[tail] = second
  push('link', 'point the tail to second', 'tail.next = second', `Tail ${values[tail]} now points to second, closing the second list.`, { count, half, last, second, tail })
  const firstOut = []
  let walk = 0
  do { firstOut.push(values[walk]); walk = next[walk] } while (walk !== 0)
  const secondOut = []
  walk = second
  do { secondOut.push(values[walk]); walk = next[walk] } while (walk !== second)
  push('done', 'return both lists', 'return head, second', `First list ${firstOut.join(', ')}; second list ${secondOut.join(', ')}.`, { count, half, last, second, tail })
  return { input: { values: [...values] }, result: [firstOut, secondOut], frames }
}
