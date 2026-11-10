// Displayed listing: the Python below is run unchanged by the test, with a ListNode class supplied.
const LISTING = [
  'class Solution:',
  '    def reverseList(self, head: ListNode) -> ListNode:',
  '        prev = None',
  '        curr = head',
  '        while curr:',
  '            nxt = curr.next',
  '            curr.next = prev',
  '            prev = curr',
  '            curr = nxt',
  '        return prev',
]

export const code = LISTING.map((text, index) => ({ line: index + 1, text }))
export const python = LISTING.join('\n') + '\n'

export const phases = [
  { id: 'init', label: 'Start', description: 'Set prev to None and curr to the head.' },
  { id: 'check', label: 'Loop test', description: 'While curr is a node, the rest of the list still needs reversing.' },
  { id: 'save', label: 'Save next', description: 'Remember curr.next before its pointer is overwritten.' },
  { id: 'rewire', label: 'Rewire', description: 'Point curr.next back at prev. This is the only pointer that changes.' },
  { id: 'move_prev', label: 'Advance prev', description: 'The node just rewired becomes the reversed prefix head.' },
  { id: 'move_curr', label: 'Advance curr', description: 'The saved next node becomes the next node to rewire.' },
  { id: 'result', label: 'Result', description: 'curr is None, so prev is the new head.' },
]

export function parseInput(text) {
  let values
  try { values = JSON.parse(text) } catch { throw new Error('Enter a JSON array such as [1, 2, 3].') }
  if (!Array.isArray(values) || values.length > 12) throw new Error('Use a JSON array of 0 to 12 integers.')
  if (!values.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Each node value is an integer from -1000 to 1000.')
  return { values }
}

// Node i is the i-th input value. links[i] is the index that node i's next pointer targets (-1 = None).
// Each frame copies the pointers after its operation, so the view can show the real state at every step.
export function buildTrace({ values }) {
  const n = values.length
  const links = Array.from({ length: n }, (_, i) => (i + 1 < n ? i + 1 : -1))
  const frames = []
  let prev = -1, curr = -1, nxt = -1
  const push = (kind, line, message, extra = {}) => frames.push({
    phase: kind, kind, activeLine: line, pythonLine: line, message,
    prev, curr, nxt, links: [...links], values, result: null, ...extra,
  })

  push('init', 3, 'prev = None: nothing is reversed yet.')
  curr = n > 0 ? 0 : -1
  push('init', 4, n > 0 ? `curr = head, node ${values[0]}.` : 'The list is empty, so curr = None.')

  while (true) {
    push('check', 5, curr >= 0 ? `curr is node ${values[curr]}, so the loop continues.` : 'curr is None, so the loop ends.')
    if (curr < 0) break
    nxt = links[curr]
    push('save', 6, nxt >= 0 ? `Save nxt = node ${values[nxt]} before overwriting curr.next.` : 'Save nxt = None: curr is the last node.')
    links[curr] = prev
    push('rewire', 7, `curr.next = prev: node ${values[curr]} now points to ${prev >= 0 ? `node ${values[prev]}` : 'None'}.`)
    prev = curr
    push('move_prev', 8, `prev = curr = node ${values[prev]}.`)
    curr = nxt
    push('move_curr', 9, curr >= 0 ? `curr = nxt = node ${values[curr]}.` : 'curr = nxt = None.')
  }

  const head = prev >= 0 ? prev : -1
  frames.push({
    phase: 'result', kind: 'result', activeLine: 10, pythonLine: 10,
    message: head >= 0 ? `Return prev: node ${values[head]} is the new head.` : 'Return prev = None: the empty list stays empty.',
    prev, curr, nxt, links: [...links], values, result: head >= 0 ? values.slice().reverse() : [],
  })
  return { input: { values }, result: frames[frames.length - 1].result, frames }
}
