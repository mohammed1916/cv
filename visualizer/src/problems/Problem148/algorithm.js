export const phases = [
  { id: 'start', label: 'Start', description: 'Read the list. Nothing has been split yet.' },
  { id: 'split', label: 'Split at middle', description: 'Slow and fast pointers find the midpoint, and the list is cut there.' },
  { id: 'merge', label: 'Merge runs', description: 'Two sorted runs are combined by repeatedly taking the smaller front node.' },
  { id: 'done', label: 'Complete', description: 'The whole list is sorted.' },
]

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length > 32) throw new Error('Enter a JSON array of 0 to 32 integers. The list is built in the order given.')
  if (!values.every(v => Number.isInteger(v) && v >= -100000 && v <= 100000)) throw new Error('Every value must be an integer from -100000 to 100000.')
  return values
}

export const code = `sort list (head):
  if head is empty or has one node: return head
  slow = head, fast = head.next
  while fast and fast.next:
    slow = slow.next, fast = fast.next.next
  right = slow.next
  slow.next = null
  left = sort list (head)
  sorted right = sort list (right)
  return merge (left, sorted right)

merge (a, b):
  tail = dummy node
  while a and b:
    if a.val <= b.val: attach a, advance a
    else: attach b, advance b
  attach the remaining list
  return dummy.next`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def sort_list(head):
    if not head or not head.next:
        return head
    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    right = slow.next
    slow.next = None
    return merge(sort_list(head), sort_list(right))

def merge(a, b):
    dummy = tail = ListNode()
    while a and b:
        if a.val <= b.val:
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next
`

function makeList(values) {
  let head = null
  for (let i = values.length - 1; i >= 0; i--) head = { val: values[i], next: head }
  return head
}
const toArray = node => { const out = []; for (let p = node; p; p = p.next) out.push(p.val); return out }

function merge(a, b, frames, out) {
  const dummy = { val: null, next: null }
  let tail = dummy
  while (a && b) {
    const takeA = a.val <= b.val
    const taken = takeA ? a.val : b.val
    frames.push({
      phase: 'merge', activeLine: takeA ? L('attach a, advance a') : L('attach b, advance b'), pythonLine: P(takeA ? 'tail.next = a' : 'tail.next = b'),
      message: `Compare ${a.val} from the left run with ${b.val} from the right run. ${taken} is smaller, so it goes next in the merged list.`,
      scene: { segment: null, left: toArray(a), right: toArray(b), merged: [...out], slow: null, fast: null },
    })
    out.push(taken)
    tail.next = takeA ? a : b
    if (takeA) a = a.next
    else b = b.next
    tail = tail.next
  }
  const rest = a || b
  tail.next = rest
  for (let p = rest; p; p = p.next) out.push(p.val)
  frames.push({
    phase: 'merge', activeLine: L('attach the remaining list'), pythonLine: P('tail.next = a or b'),
    message: rest ? 'One run is used up, so the rest of the other run is already in order and is attached as one piece.' : 'Both runs are used up, so the merged list is complete.',
    scene: { segment: null, left: [], right: [], merged: [...out], slow: null, fast: null },
  })
  return dummy.next
}

function sortList(head, frames) {
  if (!head || !head.next) return head
  let slow = head, fast = head.next, slowIndex = 0
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; slowIndex++ }
  const right = slow.next
  const segment = toArray(head)
  frames.push({
    phase: 'split', activeLine: L('right = slow.next'), pythonLine: P('right = slow.next'),
    message: `Slow stops at index ${slowIndex} and fast reaches the end, so the list is cut after index ${slowIndex} into two halves.`,
    scene: { segment, left: null, right: null, merged: null, slow: slowIndex, fast: segment.length - 1 },
  })
  slow.next = null
  const left = sortList(head, frames)
  const sortedRight = sortList(right, frames)
  return merge(left, sortedRight, frames, [])
}

export function buildTrace(values) {
  const frames = []
  frames.push({
    phase: 'start', activeLine: L('sort list (head)'), pythonLine: P('def sort_list'),
    message: values.length ? `Start with the list ${values.join(' → ')}. Split it at its midpoint until every piece has one node, then merge pieces back in order.` : 'The list is empty, so there is nothing to sort.',
    scene: { segment: values, left: null, right: null, merged: null, slow: null, fast: null },
  })
  const sorted = toArray(sortList(makeList(values), frames))
  frames.push({
    phase: 'done', activeLine: L('return merge (left'), pythonLine: P('return merge(sort_list(head)'),
    message: `The list is sorted: ${sorted.length ? sorted.join(', ') : 'empty'}.`,
    scene: { segment: sorted, left: null, right: null, merged: null, slow: null, fast: null },
  })
  return { input: values, result: sorted, frames }
}
