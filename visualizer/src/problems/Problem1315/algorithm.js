import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  const values = input?.values
  if (!Array.isArray(values) || values.length < 1 || values.length > 15 || values[0] === null) throw new Error('Use {"values": [...]} with 1 to 15 level-order entries and a non-null root.')
  if (values.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 100))) throw new Error('Node values are integers from 1 to 100, or null for a missing child.')
  return { values }
}

export function buildTrace(input) {
  const root = treeFromLevelOrder(input.values)
  const frames = [{ phase: 'start', activeLine: L('call visit on the root'), node: null, grandparent: null, total: 0, counted: [], message: 'Start at the root. It has no parent and no grandparent.' }]
  const counted = []
  let total = 0
  // grand is the grandparent value for this node; parent is the parent value passed down.
  const visit = (node, parent, grand) => {
    if (!node) return
    frames.push({ phase: 'visit', activeLine: L('if the node is empty'), node: node.id, grandparent: grand, total, counted: [...counted], message: `Visit ${node.value}. Its grandparent is ${grand ?? 'missing'}.` })
    if (grand !== null && grand % 2 === 0) {
      total += node.value
      counted.push(node.id)
      frames.push({ phase: 'add', activeLine: L('add the node value to total'), node: node.id, grandparent: grand, total, counted: [...counted], message: `Grandparent ${grand} is even, so ${node.value} joins the total: ${total}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if the grandparent exists'), node: node.id, grandparent: grand, total, counted: [...counted], message: `Grandparent ${grand ?? 'missing'} is odd or missing, so ${node.value} is not counted.` })
    }
    visit(node.left, node.value, parent)
    visit(node.right, node.value, parent)
  }
  visit(root, null, null)
  frames.push({ phase: 'done', activeLine: L('return total'), node: null, grandparent: null, total, counted: [...counted], message: `Sum of nodes with an even-valued grandparent: ${total}.` })
  return { input, root, result: total, frames }
}

export const code = `sum of values of nodes whose grandparent has an even value
  set total to zero
  call visit on the root with no parent and no grandparent
  return total
visit a node with its parent and grandparent
  if the node is empty then stop
  if the grandparent exists and its value is even then add the node value to total
  visit the left child, passing this node as parent and its parent as grandparent
  visit the right child, passing this node as parent and its parent as grandparent`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_even_grandparent(values):
    if not values or values[0] is None:
        return 0
    def make(v):
        return {'val': v, 'left': None, 'right': None}
    root = make(values[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(values) and values[cursor] is not None:
            node['left'] = make(values[cursor])
            queue.append(node['left'])
        cursor += 1
        if cursor < len(values) and values[cursor] is not None:
            node['right'] = make(values[cursor])
            queue.append(node['right'])
        cursor += 1
    total = 0
    stack = [(root, None, None)]
    while stack:
        node, parent, grand = stack.pop()
        if grand is not None and grand % 2 == 0:
            total += node['val']
        for child in (node['left'], node['right']):
            if child is not None:
                stack.append((child, node['val'], parent))
    return total
`
