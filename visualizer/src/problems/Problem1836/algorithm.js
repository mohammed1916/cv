// LeetCode 1836 (draft): Remove Duplicates From an Unsorted Linked List.
// Input: a JSON array of integers (the linked list in order; visualization cap: 12 nodes).
// Remove every node whose value occurs more than once anywhere in the list. Keep globally unique values in order.
// Pass 1 counts every value; pass 2 copies only the nodes whose count is exactly 1.

const CODE_TEXT = `FUNCTION deleteDuplicates(head)
    counts ← empty map
    node ← head
    WHILE node is present
        counts[node.value] ← counts[node.value] plus 1
        node ← node.next
    dummy ← new empty node, tail ← dummy
    node ← head
    WHILE node is present
        IF counts[node.value] equals 1
            link a copy of node after tail, move tail forward
        node ← node.next
    tail.next ← empty
    RETURN dummy.next`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def delete_duplicates(head):
    counts = {}
    node = head
    while node is not None:
        counts[node.val] = counts.get(node.val, 0) + 1
        node = node.next
    dummy = ListNode(0)
    tail = dummy
    node = head
    while node is not None:
        if counts[node.val] == 1:
            tail.next = ListNode(node.val)
            tail = tail.next
        node = node.next
    tail.next = None
    return dummy.next
`

const PY = python.split('\n')
const L = text => {
  const index = code.findIndex(c => c.text.includes(text))
  if (index < 0) throw new Error(`missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'count', label: 'Count', description: 'Pass 1: count how often each value occurs.' },
  { id: 'keep', label: 'Keep', description: 'Pass 2: this value occurs exactly once.' },
  { id: 'drop', label: 'Drop', description: 'Pass 2: this value occurs more than once.' },
  { id: 'done', label: 'Result', description: 'The list of globally unique values.' },
]

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length > 12) throw new Error('Use a JSON array of at most 12 integers.')
  if (!values.every(Number.isInteger)) throw new Error('Values are integers.')
  return values
}

export function buildTrace(values) {
  const frames = []
  const counts = new Map()
  values.forEach((v, index) => {
    counts.set(v, (counts.get(v) || 0) + 1)
    frames.push({ pythonLine: P('counts[node.val] = counts.get'), phase: 'count', activeLine: L('counts[node.value] ← counts[node.value] plus 1'), index, value: v, count: counts.get(v), counts: Object.fromEntries(counts), kept: [], message: `Value ${v} seen ${counts.get(v)} time${counts.get(v) === 1 ? '' : 's'} so far.` })
  })
  const result = []
  values.forEach((v, index) => {
    const total = counts.get(v)
    if (total === 1) {
      result.push(v)
      frames.push({ pythonLine: P('tail.next = ListNode(node.val)'), phase: 'keep', activeLine: L('IF counts[node.value] equals 1'), index, value: v, count: total, counts: Object.fromEntries(counts), kept: [...result], message: `${v} is unique: keep it.` })
    } else {
      frames.push({ pythonLine: P('if counts[node.val] == 1:'), phase: 'drop', activeLine: L('IF counts[node.value] equals 1'), index, value: v, count: total, counts: Object.fromEntries(counts), kept: [...result], message: `${v} occurs ${total} times: drop every copy.` })
    }
  })
  frames.push({ pythonLine: P('return dummy.next'), phase: 'done', activeLine: L('RETURN dummy.next'), index: values.length, value: null, count: null, counts: Object.fromEntries(counts), kept: [...result], message: result.length ? `Remaining list: ${result.join(' -> ')}.` : 'Every value was duplicated: the list is empty.' })
  return { input: values, result, frames }
}
