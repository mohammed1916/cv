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

export function buildTrace(items) {
  // A node at (depth, position) has children at (depth + 1, 2·position − 1) and (depth + 1, 2·position).
  const valueAt = new Map(items.map(item => [`${item[0]}${item[1]}`, Number(item[2])]))
  let nextId = 0
  const make = (depth, position) => {
    const key = `${depth}${position}`
    if (!valueAt.has(key)) return null
    const node = { id: nextId++, value: valueAt.get(key), left: null, right: null }
    node.left = make(depth + 1, 2 * position - 1)
    node.right = make(depth + 1, 2 * position)
    return node
  }
  const root = make(1, 1)
  let total = 0
  const visited = []
  const paths = new Map()
  const frames = [{ phase: 'start', pythonLine: 5, activeLine: L('set total to 0'), node: null, visited: [], paths: {}, total, message: 'Start at the root. Each step down appends one digit to the number on the path.' }]
  const dfs = (node, prefix) => {
    if (!node) return
    const path = prefix * 10 + node.value
    visited.push(node.id)
    paths.set(node.id, path)
    frames.push({ phase: 'visit', pythonLine: 9, activeLine: L('set path to prefix times 10'), node: node.id, visited: [...visited], paths: Object.fromEntries(paths), total, message: `Node ${node.value} makes the path number ${path}.` })
    if (!node.left && !node.right) {
      total += path
      frames.push({ phase: 'leaf', pythonLine: 12, activeLine: L('if node has no children'), node: node.id, visited: [...visited], paths: Object.fromEntries(paths), total, message: `Leaf reached: add ${path} to the total, now ${total}.` })
    }
    dfs(node.left, path)
    dfs(node.right, path)
  }
  dfs(root, 0)
  frames.push({ phase: 'done', pythonLine: 17, activeLine: L('return total'), node: null, visited: [...visited], paths: Object.fromEntries(paths), total, message: `Every root-to-leaf path is counted once. The sum is ${total}.` })
  return { input: items, root, result: total, frames }
}

export const code = `function sumRootToLeaf(codes):
  set total to 0
  set nodes to a table from (depth, position) to value, read from each code
  define dfs(node, prefix):
    set path to prefix times 10 plus the value of node
    if node has no children, add path to total
    for each child of node that exists, call dfs(child, path)
  call dfs(root, 0)
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_root_to_leaf(codes):
    nodes = {}
    for text in codes:
        nodes[(int(text[0]), int(text[1]))] = int(text[2])
    total = 0

    def dfs(depth, position, prefix):
        nonlocal total
        path = prefix * 10 + nodes[(depth, position)]
        children = [c for c in ((depth + 1, 2 * position - 1), (depth + 1, 2 * position)) if c in nodes]
        if not children:
            total += path
        for child in children:
            dfs(child[0], child[1], path)

    dfs(1, 1, 0)
    return total
`
