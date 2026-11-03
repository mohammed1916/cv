export const phases = [
  { id: 'start', label: 'Full arrays', description: 'Start with the complete preorder and inorder arrays.' },
  { id: 'visit', label: 'Take root', description: 'The first value of the current preorder slice is this subtree root.' },
  { id: 'compare', label: 'Locate root', description: 'Find the root in the inorder slice; values before it form the left subtree.' },
  { id: 'update', label: 'Create node', description: 'Create the node and place it under its parent, then build its children.' },
  { id: 'return', label: 'Return', description: 'This subtree is finished, or it is empty and becomes None.' },
  { id: 'done', label: 'Complete', description: 'The reconstructed tree reproduces both traversals.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.preorder) || !Array.isArray(data.inorder)) {
    throw new Error('Use an object with preorder and inorder arrays, for example {"preorder":[2,1,3],"inorder":[1,2,3]}.')
  }
  const { preorder, inorder } = data
  if (preorder.length < 1 || preorder.length > 20) throw new Error('Each traversal must have 1 to 20 values.')
  if (preorder.length !== inorder.length) throw new Error('Both traversals must have the same length.')
  if (![...preorder, ...inorder].every(Number.isInteger)) throw new Error('Every value must be an integer.')
  if (new Set(preorder).size !== preorder.length || new Set(inorder).size !== inorder.length) {
    throw new Error('Values in each traversal must be distinct.')
  }
  if (inorder.some(v => !preorder.includes(v))) throw new Error('Both traversals must contain the same values.')
  return { preorder, inorder }
}

const pseudo = `build(preorder, inorder):
  if preorder is empty:
    return None
  root_val = first value of preorder
  mid = position of root_val in inorder
  root = new node holding root_val
  root.left = build the subtree from the values before mid
  root.right = build the subtree from the values after mid
  return root`
const py = `def build_tree(preorder, inorder):
    if not preorder:
        return None
    root_val = preorder[0]
    mid = inorder.index(root_val)
    root = TreeNode(root_val)
    root.left = build_tree(preorder[1:mid+1], inorder[:mid])
    root.right = build_tree(preorder[mid+1:], inorder[mid+1:])
    return root`

export const code = pseudo.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = py

// Line numbers (1-based) shared by the pseudocode and Python views.
const LINE = { start: 1, empty: 3, visit: 4, compare: 5, create: 6, left: 7, right: 8, ret: 9 }

function snapshotTree(node) {
  return node ? { value: node.value, left: snapshotTree(node.left), right: snapshotTree(node.right) } : null
}

export function buildTrace(input) {
  const { preorder: pre, inorder: ino } = input
  const pos = new Map(ino.map((v, i) => [v, i]))
  const frames = []
  const holder = { left: null }
  const placed = []

  const frame = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message,
    snapshot: { preorder: pre, inorder: ino, tree: snapshotTree(holder.left), placed: [...placed], ...extra },
  })

  // ps..pe is a preorder slice and is..ie an inorder slice of the same values.
  function build(ps, pe, is, ie, parent, side) {
    if (ps >= pe) {
      frame('return', LINE.empty, `An empty ${side} slice means this child is None.`, { preRange: [ps, pe], inRange: [is, ie], root: null })
      return
    }
    const rootVal = pre[ps]
    frame('visit', LINE.visit, `Preorder's first value in this slice is ${rootVal}, so it is the root here.`, { preRange: [ps, pe], inRange: [is, ie], root: rootVal })
    const mid = pos.get(rootVal)
    if (mid === undefined || mid < is || mid >= ie) throw new Error(`The traversals disagree at ${rootVal}: no split matches both slices.`)
    const leftSize = mid - is
    for (let k = ps + 1; k <= ps + leftSize; k++) {
      if (!(pos.get(pre[k]) >= is && pos.get(pre[k]) < mid)) throw new Error(`The traversals disagree at ${rootVal}: its left part does not match.`)
    }
    for (let k = ps + leftSize + 1; k < pe; k++) {
      if (!(pos.get(pre[k]) > mid && pos.get(pre[k]) < ie)) throw new Error(`The traversals disagree at ${rootVal}: its right part does not match.`)
    }
    frame('compare', LINE.compare, `${rootVal} sits at inorder position ${mid}. ${leftSize} values before it form the left subtree.`, { preRange: [ps, pe], inRange: [is, ie], root: rootVal, mid })
    const node = { value: rootVal, left: null, right: null }
    if (parent) parent[side] = node
    else holder.left = node
    placed.push({ value: rootVal, parent: parent ? parent.value : null, side: parent ? side : 'root' })
    frame('update', LINE.create, `Create node ${rootVal}${parent ? ` as the ${side} child of ${parent.value}` : ' as the root'}.`, { preRange: [ps, pe], inRange: [is, ie], root: rootVal, mid })
    build(ps + 1, ps + 1 + leftSize, is, mid, node, 'left')
    build(ps + 1 + leftSize, pe, mid + 1, ie, node, 'right')
    frame('return', LINE.ret, `Subtree rooted at ${rootVal} is complete. Return it to its parent.`, { preRange: [ps, pe], inRange: [is, ie], root: rootVal })
  }

  frame('start', LINE.start, `Start with all ${pre.length} values. Preorder gives roots; inorder shows which values lie on each side.`, { preRange: [0, pre.length], inRange: [0, ino.length], root: null })
  build(0, pre.length, 0, ino.length, null, 'root')
  const result = holder.left
  frame('done', LINE.ret, 'Both traversals of the completed tree match the input.', { preRange: [0, pre.length], inRange: [0, ino.length], root: null })
  return { input, result, frames }
}
