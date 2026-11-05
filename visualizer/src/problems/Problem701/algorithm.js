import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, val } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 10000 || root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100000000))) throw new Error('root must be a level-order array of up to 10,000 items: integers within ±100,000,000 or null.')
  if (root[0] === null) throw new Error('The root cannot be null.')
  if (!Number.isInteger(val) || Math.abs(val) > 100000000) throw new Error('val must be an integer within ±100,000,000.')
  return { root, val }
}

// Walk from the root with the same rule as a search: smaller goes left, otherwise right. The new value
// becomes a leaf where the walk runs out, which keeps the BST order intact.
export function buildTrace({ root, val }) {
  const tree = treeFromLevelOrder(root)
  const frames = [{ phase: 'start', node: tree.id, val, inserted: null, activeLine: L('let node = root'), pythonLine: P('node = root'), message: `Insert ${val}: start at the root ${tree.value}.` }]
  let nextId = countNodes(tree)
  let node = tree
  let inserted = null
  for (;;) {
    const goLeft = val < node.value
    frames.push({ phase: 'visit', node: node.id, val, inserted: null, activeLine: L('if (val < node.val)'), pythonLine: P('if val < node["val"]'), message: `${node.value}: ${val} ${goLeft ? 'is smaller, go left' : 'is not smaller, go right'}.` })
    const next = goLeft ? node.left : node.right
    if (!next) {
      inserted = { id: nextId++, value: val, left: null, right: null }
      if (goLeft) node.left = inserted
      else node.right = inserted
      frames.push({ phase: 'insert', node: node.id, val, inserted: inserted.id, activeLine: L(goLeft ? 'node.left = ' : 'node.right = '), pythonLine: P(goLeft ? 'node["left"] = ' : 'node["right"] = '), message: `No child there: attach ${val} as a leaf.` })
      break
    }
    node = next
  }
  const result = levelValues(tree)
  frames.push({ phase: 'done', node: null, val, inserted: inserted ? inserted.id : null, result, activeLine: L('return root'), pythonLine: P('return root'), message: `New tree in level order: [${result.join(', ')}].` })
  return { input: { root, val }, root: tree, result, frames }
}

function countNodes(node) {
  if (!node) return 0
  return 1 + countNodes(node.left) + countNodes(node.right)
}

function levelValues(root) {
  const out = []
  const queue = root ? [root] : []
  for (let q = 0; q < queue.length; q++) {
    out.push(queue[q].value)
    if (queue[q].left) queue.push(queue[q].left)
    if (queue[q].right) queue.push(queue[q].right)
  }
  return out
}

const SOURCE = `function insertIntoBST(root, val) {
  if (!root) return { val, left: null, right: null }
  let node = root
  for (;;) {
    if (val < node.val) {
      if (!node.left) {
        node.left = { val, left: null, right: null }
        break
      }
      node = node.left
    } else {
      if (!node.right) {
        node.right = { val, left: null, right: null }
        break
      }
      node = node.right
    }
  }
  return root
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def insert_into_bst(root, val):
    if root is None:
        return {"val": val, "left": None, "right": None}
    node = root
    while True:
        if val < node["val"]:
            if node["left"] is None:
                node["left"] = {"val": val, "left": None, "right": None}
                break
            node = node["left"]
        else:
            if node["right"] is None:
                node["right"] = {"val": val, "left": None, "right": None}
                break
            node = node["right"]
    return root`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1

// Legacy family trace: frames already carry the line numbers used by `code`.
export const familyLine = frame => frame.activeLine
