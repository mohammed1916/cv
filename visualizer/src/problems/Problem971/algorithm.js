import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const spec = JSON.parse(text)
  const { arr, voyage } = spec
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  const values = arr.filter(v => v !== null)
  const n = values.length
  if (new Set(values).size !== n || values.some(v => !Number.isInteger(v) || v < 1 || v > n)) throw new Error(`Node values are the distinct integers 1 to ${n}.`)
  if (!Array.isArray(voyage) || voyage.length !== n || new Set(voyage).size !== n || voyage.some(v => !values.includes(v))) {
    throw new Error('voyage must list each node value once.')
  }
  return spec
}

export function buildTrace(spec) {
  const root = treeFromLevelOrder(spec.arr)
  const { voyage } = spec
  const flipped = []
  const frames = [{ phase: 'start', activeLine: L('res = []'), node: null, position: 0, flipped: [], message: `Walk the tree in preorder and match the voyage ${voyage.join(', ')}.` }]
  let position = 0
  let impossible = false
  const visit = node => {
    if (!node || impossible) return
    if (node.value !== voyage[position]) {
      impossible = true
      frames.push({ phase: 'fail', activeLine: L('return False'), node: node.id, position, flipped: [...flipped], message: `Expected ${voyage[position]} at position ${position}, found ${node.value}. No flips can fix this.` })
      return
    }
    position++
    if (node.left && node.left.value !== voyage[position]) {
      flipped.push(node.value)
      frames.push({ phase: 'flip', activeLine: L('res.append'), node: node.id, position, flipped: [...flipped], message: `${node.value}'s left child is not next in the voyage, so visit its right subtree first.` })
      visit(node.right)
      visit(node.left)
    } else {
      frames.push({ phase: 'visit', activeLine: L('dfs(node.left)'), node: node.id, position, flipped: [...flipped], message: `${node.value} matches the voyage.` })
      visit(node.left)
      visit(node.right)
    }
  }
  visit(root)
  if (impossible) return { input: spec, root, result: [-1], frames: [...frames, { phase: 'done', activeLine: L('return [-1]'), node: null, position, flipped: [], message: 'The voyage cannot be matched.' }] }
  frames.push({ phase: 'done', activeLine: L('return res'), node: null, position, flipped: [...flipped], message: `Flip ${flipped.length} node(s): ${flipped.join(', ') || 'none'}.` })
  return { input: spec, root, result: flipped, frames }
}

export const code = `def flipMatchVoyage(root, voyage):
    res = []
    i = 0
    def dfs(node):
        nonlocal i
        if not node:
            return True
        if node.val != voyage[i]:
            return False
        i += 1
        if node.left and node.left.val != voyage[i]:
            res.append(node.val)
            return dfs(node.right) and dfs(node.left)
        return dfs(node.left) and dfs(node.right)
    return res if dfs(root) else [-1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
