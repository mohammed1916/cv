const CODE_LINES = [
  'cur is the head of the list',
  'while cur is not null',
  'keep m nodes: move cur to the m-th node, stopping if the list ends',
  'after is the node that follows cur',
  'skip n nodes: move after forward n steps',
  'link cur to after and set cur to after',
  'return head',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next


def delete_after_m(values, m, n):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    cur = head
    while cur is not None:
        for _ in range(m - 1):
            if cur.next is None:
                break
            cur = cur.next
        after = cur.next
        for _ in range(n):
            if after is None:
                break
            after = after.next
        cur.next = after
        cur = after
    out = []
    while head is not None:
        out.append(head.val)
        head = head.next
    return out
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Head', description: 'Start at the first node.' },
  { id: 'keep', label: 'Keep', description: 'Retain this node in the block of m kept nodes.' },
  { id: 'drop', label: 'Delete', description: 'Remove this node from the next block of n.' },
  { id: 'done', label: 'Result', description: 'Return the retained nodes in order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with list, m and n.')
  const { list, m, n } = input
  if (!Array.isArray(list) || list.length < 1 || list.length > 20 || !list.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) throw new Error('list has 1 to 20 integers from 0 to 99 (visualization cap).')
  if (!Number.isInteger(m) || m < 1 || m > 10) throw new Error('m is an integer from 1 to 10 (visualization cap).')
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('n is an integer from 1 to 10 (visualization cap).')
  return { list, m, n }
}

export function buildTrace({ list, m, n }) {
  const size = list.length
  const status = Array(size).fill('todo')
  const frames = []
  const frame = (phase, activeLine, pythonLine, index, message) => frames.push({
    phase, activeLine, pythonLine, index, message, status: [...status], list,
  })
  frame('start', L('cur is the head'), P('cur = head'), 0, `Start at ${list[0]}: keep ${m}, then delete ${n}.`)
  let i = 0
  while (i < size) {
    const keepEnd = Math.min(size, i + m)
    for (let p = i; p < keepEnd; p++) {
      status[p] = 'keep'
      frame('keep', L('keep m nodes'), P('for _ in range(m - 1)'), p, `Keep ${list[p]}.`)
    }
    if (keepEnd >= size) break
    const deleteEnd = Math.min(size, keepEnd + n)
    for (let p = keepEnd; p < deleteEnd; p++) {
      status[p] = 'drop'
      frame('drop', L('skip n nodes'), P('for _ in range(n)'), p, `Delete ${list[p]}.`)
    }
    if (deleteEnd < size) frame('keep', L('link cur to after'), P('cur.next = after'), deleteEnd, `Link ${list[keepEnd - 1]} straight to ${list[deleteEnd]}.`)
    i = deleteEnd
  }
  const result = list.filter((_, p) => status[p] === 'keep')
  frame('done', L('return head'), P('return out'), -1, `${result.length} node${result.length === 1 ? '' : 's'} remain: [${result.join(', ')}].`)
  return { input: { list, m, n }, result, frames }
}
