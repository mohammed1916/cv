import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

function checkTree(name, arr) {
  if (!Array.isArray(arr) || arr.length > 63) throw new Error(`${name} must be a level-order JSON array with at most 63 entries.`)
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 99))) throw new Error(`${name} values must be integers 0 to 99 or null.`)
  if (arr.filter(v => v !== null).length > 30) throw new Error(`${name} may have at most 30 nodes (visualization cap).`)
  if (arr.length && arr[0] === null) throw new Error(`${name}: the root cannot be null; use [] for an empty tree.`)
}

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Enter a JSON object like {"root1":[1,2,3],"root2":[1,3,2]} with level-order arrays (null = missing).')
  checkTree('root1', obj.root1)
  checkTree('root2', obj.root2)
  return { root1: obj.root1, root2: obj.root2 }
}

export function buildTrace({ root1, root2 }) {
  const tree1 = treeFromLevelOrder(root1), tree2 = treeFromLevelOrder(root2)
  const name = (n, tag) => (n ? `${tag}${n.value}` : 'null')
  const frames = [{ phase: 'start', activeLine: 2, a: tree1?.id ?? null, b: tree2?.id ?? null, stack: [], message: 'Compare the two roots. Two trees are flip equivalent if the roots match and the children match either straight or crossed.' }]
  const rec = (a, b, stack) => {
    const ids = { a: a ? a.id : null, b: b ? b.id : null }
    frames.push({ phase: 'visit', activeLine: 2, ...ids, stack: [...stack], message: `flipEquiv(${name(a, 'A')}, ${name(b, 'B')}).` })
    if (!a && !b) {
      frames.push({ phase: 'base', activeLine: 3, ...ids, stack: [...stack], verdict: true, message: 'Both are empty: equivalent.' })
      return true
    }
    if (!a || !b || a.value !== b.value) {
      frames.push({ phase: 'base', activeLine: 5, ...ids, stack: [...stack], verdict: false,
        message: !a || !b ? 'Exactly one side is empty: not equivalent.' : `Values differ (${a.value} vs ${b.value}): not equivalent.` })
      return false
    }
    const next = [...stack, [a.id, b.id]]
    let ok = rec(a.left, b.left, next) && rec(a.right, b.right, next)
    if (!ok) {
      frames.push({ phase: 'flip', activeLine: 7, ...ids, stack: [...stack], message: `Straight pairing failed under ${a.value}: try crossing the children (A.left with B.right, A.right with B.left).` })
      ok = rec(a.left, b.right, next) && rec(a.right, b.left, next)
    }
    frames.push({ phase: 'return', activeLine: 7, ...ids, stack: [...stack], verdict: ok, message: `Subtrees at ${a.value} are ${ok ? '' : 'not '}flip equivalent.` })
    return ok
  }
  const result = rec(tree1, tree2, [])
  frames.push({ phase: 'done', activeLine: 7, a: null, b: null, stack: [], verdict: result, message: result ? 'The trees are flip equivalent.' : 'The trees are not flip equivalent.' })
  return { input: { root1: [...root1], root2: [...root2] }, tree1, tree2, result, frames }
}

export const code = `def flipEquiv(root1, root2):
    if root1 is root2:
        return True
    if not root1 or not root2 or root1.val != root2.val:
        return False
    return (flipEquiv(root1.left, root2.left) and flipEquiv(root1.right, root2.right)
            or flipEquiv(root1.left, root2.right) and flipEquiv(root1.right, root2.left))`.split('\n').map((text, index) => ({ line: index + 1, text }))
