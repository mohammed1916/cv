import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, val } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 10000 || root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 10000))) throw new Error('root must be a level-order array of up to 10,000 items: integers from −10,000 to 10,000 or null.')
  if (root[0] === null) throw new Error('The root cannot be null.')
  if (!Number.isInteger(val) || Math.abs(val) > 10000) throw new Error('val must be an integer from −10,000 to 10,000.')
  return { root, val }
}

// In a BST the target, if present, lies on the single path chosen by comparing with each node.
// Go left when the target is smaller, right when it is larger, and stop when the values match.
export function buildTrace({ root, val }) {
  let node = treeFromLevelOrder(root)
  const tree = node
  const frames = [{ phase: 'start', node: null, val, found: null, activeLine: L('let node = root'), pythonLine: P('node = root'), message: `Search for ${val} from the root.` }]
  let found = null
  while (node) {
    frames.push({ phase: 'visit', node: node.id, val, found: null, activeLine: L('while (node)'), pythonLine: P('while node'), message: `${node.value} ${val === node.value ? '=' : val < node.value ? '>' : '<'} ${val}: ${val === node.value ? 'found it.' : val < node.value ? 'go left.' : 'go right.'}` })
    if (node.value === val) { found = node; break }
    node = val < node.value ? node.left : node.right
  }
  const result = found ? levelOrder(found) : null
  frames.push({ phase: 'done', node: found ? found.id : null, val, found: found ? found.id : null, result, activeLine: L('return node'), pythonLine: P('return node'), message: found ? 'The subtree rooted here is the answer.' : 'The search fell off the tree: no match.' })
  return { input: { root, val }, tree, result, frames }
}

function levelOrder(root) {
  const out = []
  const queue = [root]
  for (let q = 0; q < queue.length; q++) {
    const n = queue[q]
    if (n) { out.push(n.value); queue.push(n.left, n.right) } else out.push(null)
  }
  while (out.at(-1) === null) out.pop()
  return out
}

const SOURCE = `function searchBST(root, val) {
  let node = root
  while (node) {
    if (node.val === val) return node
    node = val < node.val ? node.left : node.right
  }
  return null
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def search_bst(root, val):
    node = root
    while node is not None:
        if node["val"] == val:
            return node
        node = node["left"] if val < node["val"] else node["right"]
    return None`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
