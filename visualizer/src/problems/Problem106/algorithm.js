export const phases = [
  { id: 'start', label: 'Full arrays', description: 'Start with the complete inorder and postorder arrays.' },
  { id: 'visit', label: 'Take root', description: 'The last value of the current postorder slice is this subtree root.' },
  { id: 'compare', label: 'Locate root', description: 'Find the root in the inorder slice; values before it form the left subtree.' },
  { id: 'update', label: 'Create node', description: 'Create the node and place it under its parent, then build its children.' },
  { id: 'return', label: 'Return', description: 'This subtree is finished, or it is empty and becomes None.' },
  { id: 'done', label: 'Complete', description: 'The reconstructed tree reproduces both traversals.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.inorder) || !Array.isArray(data.postorder)) {
    throw new Error('Use an object with inorder and postorder arrays, for example {"inorder":[2,1,3],"postorder":[2,3,1]}.')
  }
  const { inorder, postorder } = data
  if (inorder.length < 1 || inorder.length > 20) throw new Error('Each traversal must have 1 to 20 values.')
  if (inorder.length !== postorder.length) throw new Error('Both traversals must have the same length.')
  if (![...inorder, ...postorder].every(Number.isInteger)) throw new Error('Every value must be an integer.')
  if (new Set(inorder).size !== inorder.length || new Set(postorder).size !== postorder.length) {
    throw new Error('Values in each traversal must be distinct.')
  }
  if (postorder.some(v => !inorder.includes(v))) throw new Error('Both traversals must contain the same values.')
  return { inorder, postorder }
}

const pseudo = `build(inorder, postorder):
  if inorder is empty:
    return None
  root_val = last value of postorder
  mid = position of root_val in inorder
  root = new node holding root_val
  root.right = build the subtree from the values after mid
  root.left = build the subtree from the values before mid
  return root`
const py = `def build_tree(inorder, postorder):
    if not inorder:
        return None
    root_val = postorder[-1]
    mid = inorder.index(root_val)
    root = TreeNode(root_val)
    root.right = build_tree(inorder[mid+1:], postorder[mid:-1])
    root.left = build_tree(inorder[:mid], postorder[:mid])
    return root`

export const code = pseudo.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = py

// Line numbers (1-based) shared by the pseudocode and Python views.
const LINE = { start: 1, empty: 3, visit: 4, compare: 5, create: 6, right: 7, left: 8, ret: 9 }

function snapshotTree(node) {
  return node ? { value: node.value, left: snapshotTree(node.left), right: snapshotTree(node.right) } : null
}

export function buildTrace(input) {
  const { inorder: ino, postorder: post } = input
  const pos = new Map(ino.map((v, i) => [v, i]))
  const frames = []
  const holder = { left: null }
  const placed = []

  const frame = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message,
    snapshot: { postorder: post, inorder: ino, tree: snapshotTree(holder.left), placed: [...placed], ...extra },
  })

  // ps..pe is a postorder slice and is..ie an inorder slice of the same values.
  function build(ps, pe, is, ie, parent, side) {
    if (ps >= pe) {
      frame('return', LINE.empty, `An empty ${side} slice means this child is None.`, { postRange: [ps, pe], inRange: [is, ie], root: null })
      return
    }
    const rootVal = post[pe - 1]
    frame('visit', LINE.visit, `Postorder ends this slice with ${rootVal}, so it is the root here.`, { postRange: [ps, pe], inRange: [is, ie], root: rootVal })
    const mid = pos.get(rootVal)
    if (mid === undefined || mid < is || mid >= ie) throw new Error(`The traversals disagree at ${rootVal}: no split matches both slices.`)
    const leftSize = mid - is
    for (let k = ps; k < ps + leftSize; k++) {
      if (!(pos.get(post[k]) >= is && pos.get(post[k]) < mid)) throw new Error(`The traversals disagree at ${rootVal}: its left part does not match.`)
    }
    for (let k = ps + leftSize; k < pe - 1; k++) {
      if (!(pos.get(post[k]) > mid && pos.get(post[k]) < ie)) throw new Error(`The traversals disagree at ${rootVal}: its right part does not match.`)
    }
    frame('compare', LINE.compare, `${rootVal} sits at inorder position ${mid}. ${leftSize} values before it form the left subtree.`, { postRange: [ps, pe], inRange: [is, ie], root: rootVal, mid })
    const node = { value: rootVal, left: null, right: null }
    if (parent) parent[side] = node
    else holder.left = node
    placed.push({ value: rootVal, parent: parent ? parent.value : null, side: parent ? side : 'root' })
    frame('update', LINE.create, `Create node ${rootVal}${parent ? ` as the ${side} child of ${parent.value}` : ' as the root'}.`, { postRange: [ps, pe], inRange: [is, ie], root: rootVal, mid })
    // Postorder places the right subtree just before the root, so the right slice is consumed first.
    build(ps + leftSize, pe - 1, mid + 1, ie, node, 'right')
    build(ps, ps + leftSize, is, mid, node, 'left')
    frame('return', LINE.ret, `Subtree rooted at ${rootVal} is complete. Return it to its parent.`, { postRange: [ps, pe], inRange: [is, ie], root: rootVal })
  }

  frame('start', LINE.start, `Start with all ${post.length} values. Postorder gives roots from the end; inorder shows which values lie on each side.`, { postRange: [0, post.length], inRange: [0, ino.length], root: null })
  build(0, post.length, 0, ino.length, null, 'root')
  const result = holder.left
  frame('done', LINE.ret, 'Both traversals of the completed tree match the input.', { postRange: [0, post.length], inRange: [0, ino.length], root: null })
  return { input, result, frames }
}
