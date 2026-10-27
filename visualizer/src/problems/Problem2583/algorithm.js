import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys root and k.')
  const { root, k } = input
  if (!Array.isArray(root) || root.length < 1 || root.length > 15 || root[0] === null) throw new Error('root is a level-order array of 1 to 15 entries with a non-null first entry.')
  if (root.some(v => v !== null && (!Number.isInteger(v) || v < -20 || v > 20))) throw new Error('Values are integers from -20 to 20, or null for a missing child.')
  if (!Number.isInteger(k) || k < 1 || k > 15) throw new Error('k must be an integer from 1 to 15.')
  return { root, k }
}

export function buildTrace(input) {
  const { root: values, k } = input
  const tree = treeFromLevelOrder(values)
  const frames = []
  const heap = []
  const sums = []
  const snap = (phase, activeLine, message, nodeIds = []) => frames.push({
    phase, activeLine, nodeIds, sums: [...sums], heap: [...heap], message,
  })
  const push = value => {
    heap.push(value)
    let i = heap.length - 1
    while (i > 0 && heap[(i - 1) >> 1] > heap[i]) { const p = (i - 1) >> 1; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p }
  }
  const pop = () => {
    const top = heap[0]
    const last = heap.pop()
    if (heap.length) {
      heap[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < heap.length && heap[l] < heap[m]) m = l
        if (r < heap.length && heap[r] < heap[m]) m = r
        if (m === i) break
        [heap[i], heap[m]] = [heap[m], heap[i]]
        i = m
      }
    }
    return top
  }

  snap('start', L('walk the tree level by level'), 'Walk the tree one level at a time. The heap starts empty.')
  let level = tree ? [tree] : []
  let depth = 0
  while (level.length) {
    depth++
    const total = level.reduce((s, node) => s + node.value, 0)
    sums.push(total)
    snap('sum', L('add up its values'), `Level ${depth} sums to ${total}.`, level.map(node => node.id))
    push(total)
    snap('push', L('push the level sum'), `The heap now holds ${heap.length} sum${heap.length === 1 ? '' : 's'}.`, level.map(node => node.id))
    if (heap.length > k) {
      const removed = pop()
      snap('pop', L('remove the smallest'), `The heap holds more than ${k}, so the smallest sum ${removed} leaves.`, level.map(node => node.id))
    }
    level = level.flatMap(node => [node.left, node.right].filter(Boolean))
  }
  const result = heap.length < k ? -1 : heap[0]
  snap('done', L('return the smallest sum'), result === -1 ? `Only ${heap.length} levels, fewer than k. Answer: -1.` : `The ${k}th largest level sum is ${result}.`)
  return { input, root: tree, result, frames }
}

export const code = `walk the tree level by level
set the heap to empty
for each level from top to bottom
  add up its values to get the level sum
  push the level sum onto the heap
  if the heap holds more than k sums, remove the smallest
if the heap holds fewer than k sums, return -1
return the smallest sum left in the heap`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    cursor = 1
    for item in queue:
        if cursor < len(arr) and arr[cursor] is not None:
            item.left = TreeNode(arr[cursor])
            queue.append(item.left)
        cursor += 1
        if cursor < len(arr) and arr[cursor] is not None:
            item.right = TreeNode(arr[cursor])
            queue.append(item.right)
        cursor += 1
    return root

def kth_largest_level_sum(root, k):
    heap = []
    tree = build(root)
    level = [tree] if tree else []
    while level:
        total = sum(item.val for item in level)
        heapq.heappush(heap, total)
        if len(heap) > k:
            heapq.heappop(heap)
        level = [child for item in level for child in (item.left, item.right) if child]
    return heap[0] if len(heap) == k else -1
`
