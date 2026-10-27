import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const SLOTS = 15 // a depth-4 tree has at most 15 nodes

export function parseInput(text) {
  const items = JSON.parse(text)
  if (!Array.isArray(items) || items.length < 1 || items.length > 15) throw new Error('Use 1 to 15 three-digit strings such as "113".')
  const keys = new Set()
  for (const item of items) {
    if (typeof item !== 'string' || !/^[1-4][1-8][0-9]$/.test(item)) throw new Error(`"${item}" is not a valid code: depth 1-4, position, value 0-9.`)
    const depth = Number(item[0]), position = Number(item[1])
    if (position > 2 ** (depth - 1)) throw new Error(`"${item}": position ${position} does not exist at depth ${depth}.`)
    if (keys.has(item.slice(0, 2))) throw new Error(`Two nodes share depth and position in "${item}".`)
    keys.add(item.slice(0, 2))
  }
  for (const item of items) {
    const depth = Number(item[0]), position = Number(item[1])
    if (depth > 1 && !keys.has(`${depth - 1}${Math.ceil(position / 2)}`)) throw new Error(`"${item}" has no parent in the list.`)
  }
  if (!keys.has('11')) throw new Error('The root "1" must be present.')
  return items
}

// Heap slot of a node: depth d, position p (1-based) sits at index 2^(d-1) - 1 + (p - 1).
const slotOf = (depth, position) => 2 ** (depth - 1) - 1 + (position - 1)

export function buildTrace(items) {
  const slots = Array(SLOTS).fill(null)
  for (const item of items) slots[slotOf(Number(item[0]), Number(item[1]))] = Number(item[2])
  const root = treeFromLevelOrder(slots.slice(0, slots.findLastIndex(v => v !== null) + 1))
  let total = 0
  const visited = []
  const paths = new Map()
  const frames = [{ phase: 'start', activeLine: L('total = 0'), node: null, visited: [], paths: {}, total, message: 'Start at the root. Each step down appends one digit to the number on the path.' }]
  const dfs = (node, prefix) => {
    if (!node) return
    const path = prefix * 10 + node.value
    visited.push(node.id)
    paths.set(node.id, path)
    frames.push({ phase: 'visit', activeLine: L('path = prefix * 10'), node: node.id, visited: [...visited], paths: Object.fromEntries(paths), total, message: `Node ${node.value} makes the path number ${path}.` })
    if (!node.left && !node.right) {
      total += path
      frames.push({ phase: 'leaf', activeLine: L('total += path'), node: node.id, visited: [...visited], paths: Object.fromEntries(paths), total, message: `Leaf reached: add ${path} to the total, now ${total}.` })
    }
    dfs(node.left, path)
    dfs(node.right, path)
  }
  dfs(root, 0)
  frames.push({ phase: 'done', activeLine: L('return total'), node: null, visited: [...visited], paths: Object.fromEntries(paths), total, message: `Every root-to-leaf path is counted once. The sum is ${total}.` })
  return { input: items, root, result: total, frames }
}

export const code = `def sumRootToLeaf(values):
    total = 0
    def dfs(depth, position, prefix):
        nonlocal total
        value = values[(depth, position)]
        path = prefix * 10 + value
        if (depth + 1, 2 * position - 1) not in values and (depth + 1, 2 * position) not in values:
            total += path
        for child in [(depth + 1, 2 * position - 1), (depth + 1, 2 * position)]:
            if child in values:
                dfs(child[0], child[1], path)
    dfs(1, 1, 0)
    return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
