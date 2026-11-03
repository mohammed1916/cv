export const phases = [
  { id: 'start', label: 'Heads', description: 'Both pointers start at their list heads.' },
  { id: 'compare', label: 'Compare pointers', description: 'Stop when both pointers reference the same node object, including both null.' },
  { id: 'advance', label: 'Advance and switch', description: 'Move each pointer one node; at the end of its list, jump to the other list head.' },
  { id: 'done', label: 'Return', description: 'Return the shared node, or null when the lists never meet.' },
]

export const complexity = 'O(m + n) time: each pointer walks at most both lists once. O(1) extra space: only two pointers and a step counter.'

export const examples = [
  { label: 'Shared tail', input: '{"a":[4,1],"b":[5,6,2],"tail":[8,4]}' },
  { label: 'Disjoint', input: '{"a":[3,7],"b":[9],"tail":[]}' },
  { label: 'Tail only', input: '{"a":[],"b":[1],"tail":[2,3]}' },
]

const isInt = v => Number.isInteger(v) && v >= 0 && v <= 99
const isList = v => Array.isArray(v) && v.length <= 20 && v.every(isInt)

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Enter JSON like {"a":[...],"b":[...],"tail":[...]}.')
  }
  if (!isList(data?.a) || !isList(data?.b) || !isList(data?.tail)) {
    throw new Error('a, b and tail must be arrays of up to 20 integers from 0 to 99.')
  }
  return { a: [...data.a], b: [...data.b], tail: [...data.tail] }
}

function makeNodes(prefix, values) {
  return values.map((value, i) => ({ label: `${prefix}${i}`, value, next: null }))
}

function link(nodes) {
  nodes.forEach((node, i) => { node.next = nodes[i + 1] || node.next })
}

export function buildTrace({ a, b, tail }) {
  // Own-list nodes are distinct objects; the tail nodes are one shared chain.
  const shared = makeNodes('t', tail)
  const chainA = [...makeNodes('a', a), ...shared]
  const chainB = [...makeNodes('b', b), ...shared]
  link(chainA)
  link(chainB)
  const headA = chainA[0] || null
  const headB = chainB[0] || null
  const label = node => (node ? node.label : 'null')
  let pa = headA
  let pb = headB
  let stepsA = 0
  let stepsB = 0
  const snap = () => ({ pa: label(pa), pb: label(pb), stepsA, stepsB })
  const frames = [{ phase: 'start', activeLine: 2, message: `pa starts at ${label(headA)} and pb starts at ${label(headB)}.`, snapshot: snap() }]
  for (;;) {
    const same = pa === pb
    frames.push({ phase: 'compare', activeLine: 3, message: same ? `${label(pa)} and ${label(pb)} are the same reference, so stop.` : `${label(pa)} and ${label(pb)} are different references, so keep walking.`, snapshot: snap() })
    if (same) break
    if (pa) stepsA++
    if (pb) stepsB++
    pa = pa ? pa.next : headB
    pb = pb ? pb.next : headA
    frames.push({ phase: 'advance', activeLine: 5, message: `Moved pa to ${label(pa)} and pb to ${label(pb)}. Null pointers jump to the other head.`, snapshot: snap() })
  }
  const result = label(pa) === 'null' ? 'null' : pa.label
  frames.push({ phase: 'done', activeLine: 6, message: `Return ${result === 'null' ? 'null: the lists do not intersect' : `the shared node ${result}`}.`, snapshot: snap() })
  return { input: { a, b, tail }, result, frames }
}

export const python = `def getIntersectionNode(headA, headB):
    pa, pb = headA, headB
    while pa is not pb:
        pa = pa.next if pa else headB
        pb = pb.next if pb else headA
    return pa`

export const code = [
  'FUNCTION getIntersectionNode(headA, headB)',
  '    pa = headA; pb = headB',
  '    WHILE pa is not pb',
  '        pa = pa.next if pa exists, else headB',
  '        pb = pb.next if pb exists, else headA',
  '    RETURN pa',
].map((text, index) => ({ line: index + 1, text }))

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
