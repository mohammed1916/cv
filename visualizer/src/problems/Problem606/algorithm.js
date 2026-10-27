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

export const code = `define serialize for one subtree, which returns the text of that subtree
if the subtree is empty, return the empty string
serialize the left subtree and the right subtree first
write the node value
if the node has a left or right child, append the left text in parentheses, and append the right text in parentheses when a right child exists
return the text for this subtree
return serialize applied to the root`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The tree-family visualizer reports its own step numbers (1 setup, 3 recurse, 4 combine, 5 return).
export const LINE_MAP = { 1: 1, 3: 3, 4: 5, 5: 7 }

export const python = `def tree2str(root):
    def build(values):
        if not values or values[0] is None:
            return None
        top = {'val': values[0], 'left': None, 'right': None}
        queue, i = [top], 1
        while queue and i < len(values):
            current = queue.pop(0)
            if values[i] is not None:
                current['left'] = {'val': values[i], 'left': None, 'right': None}
                queue.append(current['left'])
            i += 1
            if i < len(values) and values[i] is not None:
                current['right'] = {'val': values[i], 'left': None, 'right': None}
                queue.append(current['right'])
            i += 1
        return top

    def visit(subtree):
        if subtree is None:
            return ''
        left = visit(subtree['left'])
        right = visit(subtree['right'])
        text = str(subtree['val'])
        if subtree['left'] is not None or subtree['right'] is not None:
            text += '(' + left + ')'
        if subtree['right'] is not None:
            text += '(' + right + ')'
        return text

    return visit(build(root))`
