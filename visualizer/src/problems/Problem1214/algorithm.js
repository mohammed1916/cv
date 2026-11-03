// LeetCode 1214: Two Sum BSTs. Walk each tree in order to get two sorted lists,
// then move two pointers: one up the first list, one down the second.
const MAX_NODES = 15

export const phases = [
  { id: 'setup', label: 'Trees', description: 'Read both binary search trees.' },
  { id: 'collect', label: 'Inorder', description: 'Walk each tree in sorted order.' },
  { id: 'pair', label: 'Two pointers', description: 'Compare the smallest and largest candidates.' },
  { id: 'done', label: 'Result', description: 'Report whether a pair sums to target.' },
]

export const code = `FUNCTION twoSumBSTs(root1, root2, target)
    first ← walk(root1); second ← walk(root2)
    i ← 0; j ← last index of second
    WHILE i < length of first AND j ≥ 0
        sum ← first[i] + second[j]
        IF sum equals target THEN RETURN true
        IF sum < target THEN i ← i + 1 ELSE j ← j - 1
    RETURN false
FUNCTION walk(node, out)
    IF node is empty THEN RETURN
    walk(node.left, out)
    visit node: append node.value to out
    walk(node.right, out)`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def walk(node, out):
    if node is None:
        return
    walk(node.left, out)
    out.append(node.val)
    walk(node.right, out)


def two_sum_bsts(root1, root2, target):
    first = []
    walk(root1, first)
    second = []
    walk(root2, second)
    i, j = 0, len(second) - 1
    while i < len(first) and j >= 0:
        total = first[i] + second[j]
        if total == target:
            return True
        if total < target:
            i += 1
        else:
            j -= 1
    return False


def build_tree(levels):
    if not levels or levels[0] is None:
        return None
    root = TreeNode(levels[0])
    queue = [root]
    i = 1
    while queue and i < len(levels):
        node = queue.pop(0)
        if i < len(levels) and levels[i] is not None:
            node.left = TreeNode(levels[i])
            queue.append(node.left)
        i += 1
        if i < len(levels) and levels[i] is not None:
            node.right = TreeNode(levels[i])
            queue.append(node.right)
        i += 1
    return root


if __name__ == "__main__":
    import sys, json
    data = json.loads(sys.stdin.read())
    print(json.dumps(two_sum_bsts(build_tree(data["root1"]), build_tree(data["root2"]), data["target"])))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

// Level-order array with nulls, as LeetCode serializes a tree. Returns a tree or null.
export function buildTree(levels) {
  if (!levels.length || levels[0] === null) return null
  const root = { value: levels[0], left: null, right: null }
  const queue = [root]
  let i = 1
  while (queue.length && i < levels.length) {
    const node = queue.shift()
    if (levels[i] !== null && levels[i] !== undefined) { node.left = { value: levels[i], left: null, right: null }; queue.push(node.left) }
    i += 1
    if (i < levels.length && levels[i] !== null && levels[i] !== undefined) { node.right = { value: levels[i], left: null, right: null }; queue.push(node.right) }
    i += 1
  }
  return root
}

// Positions for drawing: x is the inorder rank, y is depth.
export function layoutTree(levels) {
  const nodes = []
  const edges = []
  let rank = 0
  function place(node, depth) {
    if (!node) return -1
    const left = place(node.left, depth + 1)
    const id = nodes.length
    nodes.push({ value: node.value, x: rank, y: depth })
    rank += 1
    const right = place(node.right, depth + 1)
    if (left >= 0) edges.push([id, left])
    if (right >= 0) edges.push([id, right])
    return id
  }
  place(buildTree(levels), 0)
  return { nodes, edges }
}

function inorderValues(levels) {
  const out = []
  function walk(node) {
    if (!node) return
    walk(node.left)
    out.push(node.value)
    walk(node.right)
  }
  walk(buildTree(levels))
  return out
}

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with root1, root2 and target.')
  const { root1, root2, target } = input
  for (const [name, levels] of [['root1', root1], ['root2', root2]]) {
    if (!Array.isArray(levels) || levels.length < 1 || levels.length > MAX_NODES) throw new Error(`${name} is a level-order array of 1 to ${MAX_NODES} entries.`)
    if (levels[0] === null) throw new Error(`${name} needs a root value.`)
    if (!levels.every(v => v === null || Number.isInteger(v))) throw new Error(`${name} holds integers or null.`)
    const sorted = inorderValues(levels)
    if (sorted.some((v, k) => k > 0 && v < sorted[k - 1])) throw new Error(`${name} is not a binary search tree.`)
  }
  if (!Number.isInteger(target)) throw new Error('target is an integer.')
  return { root1, root2, target }
}

export function buildTrace({ root1, root2, target }) {
  let first = []
  let second = []
  const frames = []
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    first: first.slice(), second: second.slice(), walk: null, current: null, i: -1, j: -1, sum: null, pair: null,
    ...extra,
  })

  emit('setup', 'first ← walk(root1)', 'first = []', `Two trees with ${inorderValues(root1).length} and ${inorderValues(root2).length} nodes.`)
  function walk(node, out, which) {
    if (!node) return
    walk(node.left, out, which)
    out.push(node.value)
    emit('collect', 'visit node', 'out.append(node.val)', `Visit ${node.value} and add it to the ${which} list.`, { walk: which, current: node.value })
    walk(node.right, out, which)
  }
  walk(buildTree(root1), first, 'first')
  walk(buildTree(root2), second, 'second')
  emit('collect', 'first ← walk(root1)', 'walk(root2, second)', 'Both sorted lists are ready.', {})

  let i = 0
  let j = second.length - 1
  let pair = null
  emit('pair', 'i ← 0; j ← last index', 'i, j = 0, len(second) - 1', `Start at ${first[0]} in the first list and ${second[j]} in the second.`, { i, j })
  while (i < first.length && j >= 0) {
    const total = first[i] + second[j]
    emit('pair', 'sum ← first[i] + second[j]', 'total = first[i] + second[j]', `${first[i]} + ${second[j]} = ${total}; target is ${target}.`, { i, j, sum: total })
    if (total === target) {
      pair = [first[i], second[j]]
      emit('pair', 'IF sum equals target', 'if total == target', `${first[i]} and ${second[j]} sum to ${target}.`, { i, j, sum: total, pair })
      break
    }
    if (total < target) {
      emit('pair', 'IF sum < target', 'if total < target', `${total} is below ${target}, so move i up.`, { i, j, sum: total })
      i += 1
    } else {
      emit('pair', 'IF sum < target', 'else', `${total} is above ${target}, so move j down.`, { i, j, sum: total })
      j -= 1
    }
  }
  const result = pair !== null
  emit('done', result ? 'IF sum equals target' : 'RETURN false', result ? 'return True' : 'return False',
    result ? 'A pair sums to the target.' : 'The pointers met without a pair.', { i, j, pair, result })
  return { input: { root1, root2, target }, result, pair, frames }
}
