import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 3000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 1000))) throw new Error('Enter a LeetCode level-order array of 1–3,000 items: integers from −1,000 to 1,000 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const frames = [{ phase: 'start', current: null, text: '', activeLine: 2, message: 'Write the root value, then each child in parentheses; an empty right child is omitted.' }]
  const parts = []
  function walk(node) {
    if (!node) return
    parts.push(String(node.value))
    frames.push({ phase: 'write', current: node.id, text: parts.join(''), activeLine: 4, message: `Write ${node.value}.` })
    if (node.left || node.right) {
      parts.push('(')
      walk(node.left)
      parts.push(')')
      if (node.right) { parts.push('('); walk(node.right); parts.push(')') }
    }
  }
  walk(root)
  const result = parts.join('')
  frames.push({ phase: 'done', current: null, text: result, result, activeLine: 8, message: `String: ${result}` })
  return { input: values, root, result, frames }
}

export const code = `def tree2str(root):
    if not root: return ''
    s = str(root.val)
    if root.left or root.right:
        s += '(' + tree2str(root.left) + ')'
    if root.right:
        s += '(' + tree2str(root.right) + ')'
    return s`.split('\n').map((text, index) => ({ line: index + 1, text }))
