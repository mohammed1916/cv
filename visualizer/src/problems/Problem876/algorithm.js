export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 100 || values.some(v => !Number.isInteger(v) || v < 1 || v > 100)) {
    throw new Error('Enter a JSON array of 1–100 integers (list node values), each between 1 and 100.')
  }
  return values
}

import { createListTracker } from '../../components/shared/listPointerModel.js'

export function buildTrace(values) {
  const n = values.length
  const table = Object.fromEntries(values.map((val, i) => [i, { val, next: i + 1 < n ? i + 1 : null }]))
  const tracker = createListTracker()
  const view = (slow, fast) => tracker.snapshot(table, 0, [{ label: 'slow', nodeId: slow }, { label: 'fast', nodeId: fast < n ? fast : null }], [slow], { title: 'Pointers (slow = slow.next, fast = fast.next.next)' })
  let slow = 0
  let fast = 0
  const frames = [{ phase: 'start', slow, fast, view: view(slow, fast), activeLine: 2, message: 'Both pointers start at the head. fast will move twice as quickly as slow.' }]
  while (fast < n && fast + 1 < n) {
    frames.push({ phase: 'check', slow, fast, view: view(slow, fast), activeLine: 3, message: `fast is at node ${fast} and fast.next exists, so the pointers can advance.` })
    slow += 1
    fast += 2
    frames.push({
      phase: 'advance', slow, fast, view: view(slow, fast), activeLine: 5,
      message: `slow moves to node ${slow}; fast jumps two nodes to ${fast < n ? `node ${fast}` : 'null'}. slow has travelled half as far as fast.`,
    })
  }
  frames.push({
    phase: 'check', slow, fast, view: view(slow, fast), activeLine: 3,
    message: fast >= n ? 'fast is null, so the list had even length and slow is the second middle node.' : `fast is on the last node (fast.next is null), so slow is the exact middle.`,
  })
  const result = values.slice(slow)
  frames.push({ phase: 'done', slow, fast, view: view(slow, fast), activeLine: 6, message: `Return the node at index ${slow}; the returned list is [${result.join(', ')}].` })
  return { input: [...values], result, frames }
}

export const code = `def middleNode(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`.split('\n').map((text, index) => ({ line: index + 1, text }))
