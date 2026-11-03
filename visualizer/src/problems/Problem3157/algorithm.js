// LeetCode 3157: the one-based level of a binary tree whose node values sum to the smallest total.
// Ties go to the smaller level number. The tree arrives as a level-order list with null for a
// missing child, the usual LeetCode serialization. A breadth-first pass sums each level in turn.

const MAX_NODES = 31
const MAX_ABS = 100000

const CODE_TEXT = `FUNCTION minSumLevel(root)
    queue ← [root]
    level ← 1; bestLevel ← 1; bestSum ← none
    WHILE queue is not empty
        count ← length of queue; total ← 0
        REPEAT count times
            node ← pop front of queue
            total ← total + node value
            push node's left and right children that exist
        IF bestSum is none OR total < bestSum THEN bestSum ← total; bestLevel ← level
        level ← level + 1
    RETURN bestLevel`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `from collections import deque


class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def min_sum_level(root):
    queue = deque([root])
    level = 1
    best_level, best_sum = 1, None
    while queue:
        count = len(queue)
        total = 0
        for _ in range(count):
            node = queue.popleft()
            total += node.val
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        if best_sum is None or total < best_sum:
            best_sum, best_level = total, level
        level += 1
    return best_level
`
const PY = s => {
  const index = python.split('\n').findIndex(c => c.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > MAX_NODES) throw new Error(`Use a level-order list of 1 to ${MAX_NODES} entries.`)
  if (!Number.isInteger(values[0])) throw new Error('The first entry is the root value, an integer.')
  for (const value of values) {
    if (value !== null && (!Number.isInteger(value) || Math.abs(value) > MAX_ABS)) throw new Error(`Entries are integers from -${MAX_ABS} to ${MAX_ABS}, or null.`)
  }
  return values
}

// Builds the tree from a LeetCode-style list: children are read in order, skipping nulls.
function buildTree(values) {
  let nextId = 0
  const root = { id: nextId++, val: values[0], left: null, right: null }
  const queue = [root]
  let head = 0
  let index = 1
  while (head < queue.length && index < values.length) {
    const parent = queue[head++]
    for (const side of ['left', 'right']) {
      if (index >= values.length) break
      const value = values[index++]
      if (value === null) continue
      const child = { id: nextId++, val: value, left: null, right: null }
      parent[side] = child
      queue.push(child)
    }
  }
  return root
}

export function buildTrace(values) {
  const root = buildTree(values)
  const frames = []
  const sums = []
  const processed = []
  let bestLevel = 1
  let bestSum = null
  let level = 1
  let queue = [root]
  frames.push({ phase: 'start', pythonLine: PY('queue = deque([root])'), activeLine: L('queue ← [root]'), level: 1, processed: [], total: 0, bestLevel, bestSum, sums: [], message: `Start the queue with the root, value ${root.val}.` })
  while (queue.length > 0) {
    const count = queue.length
    let total = 0
    frames.push({ phase: 'level', pythonLine: PY('count = len(queue)'), activeLine: L('count ← length of queue'), level, processed: [], total: 0, bestLevel, bestSum, sums: sums.slice(), message: `Level ${level} has ${count} node${count === 1 ? '' : 's'} in the queue.` })
    const thisLevel = []
    for (let k = 0; k < count; k++) {
      const node = queue.shift()
      total += node.val
      thisLevel.push(node.id)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
      processed.push(node.id)
      frames.push({ phase: 'visit', pythonLine: PY('total += node.val'), activeLine: L('total ← total + node value'), level, processed: thisLevel.slice(), total, bestLevel, bestSum, sums: sums.slice(), message: `Add ${node.val}; level ${level} total is ${total}.` })
    }
    sums.push(total)
    const improved = bestSum === null || total < bestSum
    if (improved) {
      bestSum = total
      bestLevel = level
    }
    frames.push({ phase: improved ? 'best' : 'keep', pythonLine: PY('if best_sum is None or total < best_sum'), activeLine: L('IF bestSum is none'), level, processed: thisLevel.slice(), total, bestLevel, bestSum, sums: sums.slice(), message: improved ? `Level ${level} sums to ${total}, the smallest so far.` : `Level ${level} sums to ${total}; ${bestSum} at level ${bestLevel} still wins.` })
    level++
  }
  frames.push({ phase: 'done', pythonLine: PY('return best_level'), activeLine: L('RETURN bestLevel'), level: bestLevel, processed: processed.slice(), total: bestSum, bestLevel, bestSum, sums: sums.slice(), message: `Level ${bestLevel} has the minimum sum ${bestSum}.` })
  return { input: values, root, result: bestLevel, frames }
}
