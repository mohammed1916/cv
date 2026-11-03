export const phases = [
  { id: 'start', label: 'Start', description: 'A dummy node sits before the list. The first node alone is already sorted.' },
  { id: 'compare', label: 'Compare', description: 'Compare the current unsorted node with the last node of the sorted part.' },
  { id: 'advance', label: 'Extend sorted part', description: 'The node is already in order, so the sorted part grows by one.' },
  { id: 'search', label: 'Find position', description: 'Walk from the dummy node until the next sorted value is not smaller.' },
  { id: 'insert', label: 'Insert', description: 'Unlink the node and splice it in after the position found.' },
  { id: 'done', label: 'Complete', description: 'Return the sorted list from the dummy node.' },
]

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 30 || !values.every(v => Number.isInteger(v) && Math.abs(v) <= 99)) {
    throw new Error('Use a JSON array of 1 to 30 integers from -99 to 99.')
  }
  return { values }
}

const at = (activeLine, pythonLine = activeLine) => ({ activeLine, pythonLine })
// Pseudocode line -> Python line, where the two listings differ in length.
const PYTHON_LINE = { 13: 14, 15: 16 }

export function buildTrace({ values }) {
  const nodes = values.map((value, id) => ({ id, value, next: null }))
  nodes.forEach((node, i) => { node.next = nodes[i + 1] ?? null })
  const dummy = { id: 'dummy', value: null, next: nodes[0] }
  const walk = () => {
    const out = []
    for (let p = dummy.next; p; p = p.next) out.push({ id: p.id, value: p.value })
    return out
  }
  const label = node => (node === dummy ? 'the dummy head' : node.value)
  const frames = []
  let prev = nodes[0]
  let cur = nodes[0].next
  const frame = (phase, line, action, message, pos = null) => frames.push({
    phase, ...at(line, PYTHON_LINE[line] ?? line),
    snapshot: { action, list: walk(), prevId: prev?.id ?? null, curId: cur?.id ?? null, posId: pos?.id ?? null },
    message,
  })

  if (!cur) {
    frame('done', 2, 'single', `One value is already sorted. Return [${values[0]}].`)
  } else {
    frame('start', 4, 'start', `The sorted part is just ${prev.value}. Next, insert ${cur.value}.`)
    while (cur) {
      frame('compare', 6, 'compare', `Compare ${cur.value} with the last sorted value ${prev.value}.`)
      if (cur.value >= prev.value) {
        prev = cur
        frame('advance', 7, 'advance', `${cur.value} is not smaller, so it extends the sorted part.`)
      } else {
        let pos = dummy
        frame('search', 9, 'search', `${cur.value} is smaller, so search from the dummy head.`, pos)
        while (pos.next.value < cur.value) {
          frame('search', 10, 'check', `${pos.next.value} is smaller than ${cur.value}, so move past it.`, pos)
          pos = pos.next
          frame('search', 11, 'move', `Position moves forward to ${label(pos)}.`, pos)
        }
        frame('search', 10, 'found', `${pos.next.value} is not smaller than ${cur.value}, so insert after ${label(pos)}.`, pos)
        prev.next = cur.next
        cur.next = pos.next
        pos.next = cur
        frame('insert', 13, 'insert', `${cur.value} is spliced in after ${label(pos)}.`, pos)
      }
      cur = prev.next
    }
  }
  const result = walk().map(node => node.value)
  frame('done', 15, 'done', `Return [${result.join(', ')}].`)
  return { input: { values }, result, frames }
}

export const code = [
  'insertion sort list (head):',
  '  if head is empty or has one node: return head',
  '  dummy = new node with next = head',
  '  prev = head; cur = head.next',
  '  while cur exists:',
  '    if cur.value >= prev.value:',
  '      prev = cur',
  '    else:',
  '      pos = dummy',
  '      while pos.next.value < cur.value:',
  '        pos = pos.next',
  '      unlink cur after prev',
  '      insert cur after pos',
  '    cur = prev.next',
  '  return dummy.next',
].map((text, index) => ({ line: index + 1, text }))

export const python = [
  'def insertion_sort_list(head):',
  '    if not head or not head.next: return head',
  '    dummy = ListNode(0, head)',
  '    prev, cur = head, head.next',
  '    while cur:',
  '        if cur.val >= prev.val:',
  '            prev = cur',
  '        else:',
  '            pos = dummy',
  '            while pos.next.val < cur.val:',
  '                pos = pos.next',
  '            prev.next = cur.next',
  '            cur.next = pos.next',
  '            pos.next = cur',
  '        cur = prev.next',
  '    return dummy.next',
].join('\n')
