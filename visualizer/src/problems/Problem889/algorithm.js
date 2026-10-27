import { levelOrderFromTree } from '../../components/shared/treeLayout.js'

function build(preorder, postorder, onEvent) {
  const postIndex = new Map(postorder.map((v, i) => [v, i]))
  const nodes = new Map()
  const make = v => { const node = { id: v, value: v, left: null, right: null }; nodes.set(v, node); return node }
  function rec(preLo, preHi, postLo) {
    if (preLo > preHi) return null
    const root = make(preorder[preLo])
    onEvent?.('root', { root, preLo, preHi, postLo })
    if (preLo === preHi) return root
    const leftRoot = preorder[preLo + 1]
    const leftSize = postIndex.get(leftRoot) - postLo + 1
    if (!(leftSize >= 1 && leftSize <= preHi - preLo)) throw new Error('The preorder and postorder arrays do not describe the same binary tree.')
    onEvent?.('split', { root, preLo, preHi, postLo, leftRoot, leftSize })
    root.left = rec(preLo + 1, preLo + leftSize, postLo)
    root.right = rec(preLo + leftSize + 1, preHi, postLo + leftSize)
    return root
  }
  return { root: rec(0, preorder.length - 1, 0), nodes }
}

function traversals(root) {
  const pre = [], post = []
  const walk = n => { if (!n) return; pre.push(n.value); walk(n.left); walk(n.right); post.push(n.value) }
  walk(root)
  return { pre, post }
}

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || !Array.isArray(obj.preorder) || !Array.isArray(obj.postorder)) throw new Error('Enter JSON like {"preorder": [1,2,4,5,3,6,7], "postorder": [4,5,2,6,7,3,1]}.')
  const { preorder, postorder } = obj
  const n = preorder.length
  if (n < 1 || n > 30 || postorder.length !== n) throw new Error('Both arrays must have the same length between 1 and 30 (visualization cap).')
  const ok = a => a.every(v => Number.isInteger(v) && v >= 1 && v <= 1000) && new Set(a).size === n
  if (!ok(preorder) || !ok(postorder) || preorder.some(v => !postorder.includes(v))) throw new Error('Both arrays must contain the same distinct integers between 1 and 1000.')
  if (preorder[0] !== postorder[n - 1]) throw new Error('The root must be first in preorder and last in postorder.')
  let built
  try { built = build(preorder, postorder) } catch (e) { throw new Error(e.message, { cause: e }) }
  const t = traversals(built.root)
  if (t.pre.join() !== preorder.join() || t.post.join() !== postorder.join()) throw new Error('The preorder and postorder arrays do not describe the same binary tree.')
  return { preorder: [...preorder], postorder: [...postorder] }
}

export function buildTrace({ preorder, postorder }) {
  const frames = [{ phase: 'start', count: 0, active: null, preLo: null, preHi: null, postLo: null, activeLine: L('map each postorder value'), message: 'Preorder visits root, left, right; postorder visits left, right, root. The first preorder value is the root, and the next one is the root of the left subtree.' }]
  const { root } = build(preorder, postorder, (kind, info) => {
    if (kind === 'root') {
      frames.push({ phase: 'root', count: info.preLo + 1, active: info.root.value, preLo: info.preLo, preHi: info.preHi, postLo: info.postLo, activeLine: L('create a node from preorder'), message: `build(pre ${info.preLo}..${info.preHi}, post from ${info.postLo}): create node ${info.root.value} from preorder[${info.preLo}].` })
    } else {
      frames.push({ phase: 'split', count: info.preLo + 1, active: info.root.value, preLo: info.preLo, preHi: info.preHi, postLo: info.postLo, activeLine: L('let left_size be'), message: `Left subtree root is preorder[${info.preLo + 1}] = ${info.leftRoot}. In postorder it sits at index ${info.postLo + info.leftSize - 1}, so the left subtree has ${info.leftSize} node(s); the rest are the right subtree.` })
    }
  })
  const result = levelOrderFromTree(root)
  frames.push({ phase: 'done', count: preorder.length, active: root.value, preLo: null, preHi: null, postLo: null, activeLine: L('return build(0'), message: `Tree built. Level-order serialization: [${result.join(', ')}].` })
  return { input: { preorder, postorder }, result, tree: root, frames }
}

/** The part of the final tree made of the first `count` preorder values (nodes are created in preorder). */
export function partialTree(run, count) {
  const keep = new Set(run.input.preorder.slice(0, count))
  const copy = n => (n && keep.has(n.value) ? { id: n.id, value: n.value, left: copy(n.left), right: copy(n.right) } : null)
  return copy(run.tree)
}

export const code = `let post_index map each postorder value to its position
define build(pre_lo, pre_hi, post_lo), which builds the subtree for a range
  if pre_lo is greater than pre_hi, return empty
  create a node from preorder[pre_lo] as the root
  if pre_lo equals pre_hi, return the root, a leaf
  let left_root be preorder[pre_lo + 1]
  let left_size be the position of left_root in postorder, minus post_lo, plus 1
  attach build(pre_lo + 1, pre_lo + left_size, post_lo) as the left child
  attach build(pre_lo + left_size + 1, pre_hi, post_lo + left_size) as the right child
  return the root
return build(0, n - 1, 0), the root of the whole tree`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def construct_from_pre_post(preorder, postorder):
    post_index = {v: i for i, v in enumerate(postorder)}

    def build(pre_lo, pre_hi, post_lo):
        if pre_lo > pre_hi:
            return None
        root = TreeNode(preorder[pre_lo])
        if pre_lo == pre_hi:
            return root
        left_root = preorder[pre_lo + 1]
        left_size = post_index[left_root] - post_lo + 1
        root.left = build(pre_lo + 1, pre_lo + left_size, post_lo)
        root.right = build(pre_lo + left_size + 1, pre_hi, post_lo + left_size)
        return root

    root = build(0, len(preorder) - 1, 0)
    out = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        if node is None:
            out.append(None)
        else:
            out.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out
`
