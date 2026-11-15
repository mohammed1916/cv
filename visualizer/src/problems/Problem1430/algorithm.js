const CODE_LINES = [
  'function isValidSequence(root, arr) {',
  '  const check = (node, k) => {',
  '    // node is missing or node.val differs from arr[k]: return false',
  '    if (node === null || node.val !== arr[k]) return false',
  '    // if k is the last index, return true only when node is a leaf',
  '    if (k === arr.length - 1) return node.left === null && node.right === null',
  '    // for each child of node, try to continue the sequence',
  '    for (const child of [node.left, node.right]) {',
  '      if (child !== null && check(child, k + 1)) return true',
  '    }',
  '    return false',
  '  }',
  '  return root !== null && check(root, 0)',
  '}',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}
const LAST = text => CODE_LINES.length - [...CODE_LINES].reverse().findIndex(line => line.includes(text))

export const python = `def is_valid_sequence(tree, arr):
    kids = {}
    pending = [0]
    nxt = 1
    for i in pending:
        kids[i] = []
        for _ in range(2):
            if nxt < len(tree):
                if tree[nxt] is not None:
                    kids[i].append(nxt)
                    pending.append(nxt)
                nxt += 1

    def check(i, k):
        if tree[i] != arr[k]:
            return False
        if k == len(arr) - 1:
            return not kids[i]
        for c in kids[i]:
            if check(c, k + 1):
                return True
        return False

    return bool(tree) and tree[0] is not None and check(0, 0)
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'enter', label: 'Visit', description: 'Compare this node with the next array value.' },
  { id: 'mismatch', label: 'Mismatch', description: 'The node value differs from the array value.' },
  { id: 'leaf', label: 'Last value', description: 'The array ends here, so the node must be a leaf.' },
  { id: 'short', label: 'Not a leaf', description: 'The path ends early at a node with children.' },
  { id: 'backtrack', label: 'Backtrack', description: 'Neither child continues the sequence.' },
  { id: 'found', label: 'Found', description: 'This node completes a valid root-to-leaf path.' },
  { id: 'done', label: 'Result', description: 'Report whether a valid path exists.' },
]

// LeetCode level-order array with nulls: the children of the k-th non-null node take the next two positions.
export function buildKids(tree) {
  const kids = {}
  const pending = [0]
  let next = 1
  for (let p = 0; p < pending.length; p++) {
    const i = pending[p]
    kids[i] = []
    for (let side = 0; side < 2; side++) {
      if (next < tree.length) {
        if (tree[next] !== null) {
          kids[i].push(next)
          pending.push(next)
        }
        next++
      }
    }
  }
  if (pending.length !== tree.filter(value => value !== null).length) throw new Error('tree is not a valid level-order array.')
  return kids
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with tree and arr.')
  const { tree, arr } = input
  if (!Array.isArray(tree) || tree.length < 1 || tree.length > 15 || tree[0] === null) throw new Error('tree is a level-order array of 1 to 15 entries, starting with a non-null root (visualization cap).')
  if (!tree.every(value => value === null || (Number.isInteger(value) && value >= 0 && value <= 9))) throw new Error('Tree values are integers from 0 to 9 (visualization cap).')
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 10 || !arr.every(value => Number.isInteger(value) && value >= 0 && value <= 9)) throw new Error('arr has 1 to 10 integers from 0 to 9 (visualization cap).')
  buildKids(tree)
  return { tree, arr }
}

export function buildTrace({ tree, arr }) {
  const kids = buildKids(tree)
  const frames = []
  const path = []
  // Search tree: one node per call to check(); each node records its decision and the partial match.
  const searchNodes = []
  const byId = new Map()
  const snapshot = () => searchNodes.map(node => ({ ...node, children: [...node.children] }))
  const frame = (phase, activeLine, pythonLine, node, k, message, activeNodeId) => frames.push({
    phase, activeLine, pythonLine, node, k, message, path: [...path], kids, treeNodes: snapshot(), activeNodeId,
  })
  const addNode = (i, parentId, depth, k) => {
    const node = {
      id: `n${i}`, parentId, depth, value: tree[i], decision: null, pruneReason: undefined,
      choice: parentId === null ? null : `go to node ${i}`,
      subtitle: k > 0 ? `matched ${arr.slice(0, k).join(' ')}` : 'nothing matched yet',
      children: [],
    }
    searchNodes.push(node)
    byId.set(node.id, node)
    if (parentId !== null) byId.get(parentId).children.push(node.id)
    return node
  }
  const check = (i, k, parentId, depth) => {
    const searchNode = addNode(i, parentId, depth, k)
    const id = searchNode.id
    path.push(i)
    if (tree[i] !== arr[k]) {
      searchNode.decision = 'pruned'
      searchNode.pruneReason = `${tree[i]} is not ${arr[k]}`
      frame('mismatch', L('node.val differs'), P('if tree[i] != arr[k]'), i, k, `Node ${i} has ${tree[i]}, but arr[${k}] is ${arr[k]}.`, id)
      path.pop()
      return false
    }
    searchNode.decision = 'chosen'
    frame('enter', L('node is missing'), P('if tree[i] != arr[k]'), i, k, `Node ${i} matches arr[${k}] = ${arr[k]}.`, id)
    if (k === arr.length - 1) {
      const leaf = kids[i].length === 0
      if (leaf) {
        frame('found', L('if k is the last index'), P('if k == len(arr) - 1'), i, k, `arr ends on leaf ${i}: a valid path.`, id)
        return true
      }
      searchNode.decision = 'pruned'
      searchNode.pruneReason = 'array ends at an inner node'
      frame('short', L('if k is the last index'), P('if k == len(arr) - 1'), i, k, `arr ends at node ${i}, which has children, so this is not a root-to-leaf path.`, id)
      path.pop()
      return false
    }
    for (const child of kids[i]) {
      frame('enter', L('for each child of node'), P('for c in kids[i]'), i, k, `Try child ${child} for arr[${k + 1}] = ${arr[k + 1]}.`, id)
      if (check(child, k + 1, id, depth + 1)) {
        frame('found', L('check(child, k + 1)'), P('if check(c, k + 1)'), child, k + 1, 'The child continues the valid path.', id)
        return true
      }
    }
    searchNode.decision = 'ignored'
    frame('backtrack', LAST('return false'), P('return False'), i, k, `No child of ${i} continues the sequence.`, id)
    path.pop()
    return false
  }
  const result = tree[0] !== null && check(0, 0, null, 0)
  frame('done', L('return root !== null'), P('return bool(tree)'), -1, -1, result ? 'A root-to-leaf path spells arr.' : 'No root-to-leaf path spells arr.', null)
  return { input: { tree, arr }, result, frames, kids, tree: searchNodes }
}
