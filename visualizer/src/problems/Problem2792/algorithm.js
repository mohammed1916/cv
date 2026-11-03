// Tree input is level order with null for a missing child, as in the official examples.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with tree and k.')
  const { tree, k } = input
  if (!Array.isArray(tree) || tree.length < 1 || tree.length > 15) throw new Error('tree is a level-order list of 1 to 15 entries.')
  if (tree[0] === null) throw new Error('The first entry is the root and cannot be null.')
  if (!tree.every(v => v === null || (Number.isInteger(v) && v >= -99 && v <= 99))) throw new Error('Each node value is an integer from -99 to 99, or null.')
  if (!Number.isInteger(k) || k < 0 || k > 15) throw new Error('k is an integer from 0 to 15.')
  return { tree, k }
}

// Build nodes with ids equal to their index in the level-order list.
export function buildNodes(tree) {
  const byId = tree.map((val, id) => (val === null ? null : { id, val, left: -1, right: -1 }))
  const queue = [0]
  let cursor = 1
  for (let q = 0; q < queue.length; q++) {
    const node = byId[queue[q]]
    for (const side of ['left', 'right']) {
      if (cursor >= tree.length) break
      const childId = cursor++
      if (byId[childId]) {
        node[side] = childId
        queue.push(childId)
      }
    }
  }
  return byId.filter(Boolean)
}

export function buildTrace({ tree, k }) {
  const nodes = buildNodes(tree)
  const byId = new Map(nodes.map(n => [n.id, n]))
  const frames = []
  let count = 0
  const verdicts = {}
  const snap = over => ({ node: -1, values: null, smaller: null, qualifies: null, count, verdicts: { ...verdicts }, k, result: null, ...over })

  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('count = 0'), message: `Need at least ${k} strictly smaller values below each node.`, ...snap({}) })

  // Returns the list of values in the subtree rooted at id, like visit() in the python export.
  const visit = id => {
    if (id < 0) return []
    const node = byId.get(id)
    frames.push({ pythonLine: 7, phase: 'enter', activeLine: L('values = [node value]'), message: `Enter node ${node.val} and start its subtree list.`, ...snap({ node: id }) })
    let values = [node.val]
    const fromLeft = visit(node.left)
    values = values.concat(fromLeft)
    const fromRight = visit(node.right)
    values = values.concat(fromRight)
    frames.push({ pythonLine: 9, phase: 'collect', activeLine: L('append values of visit(right'), message: `Node ${node.val} now has ${values.length} value${values.length === 1 ? '' : 's'} in its subtree.`, ...snap({ node: id, values: values.slice() }) })
    let smaller = 0
    for (const v of values) {
      if (v < node.val) smaller++
    }
    frames.push({ pythonLine: 13, phase: 'tally', activeLine: L('smaller = number of values'), message: `${smaller} value${smaller === 1 ? '' : 's'} in the subtree ${smaller === 1 ? 'is' : 'are'} strictly smaller than ${node.val}.`, ...snap({ node: id, values: values.slice(), smaller }) })
    if (smaller >= k) {
      count++
      verdicts[id] = 'yes'
      frames.push({ pythonLine: 15, phase: 'qualify', activeLine: L('if smaller is at least k'), message: `${smaller} is at least ${k}, so node ${node.val} counts.`, ...snap({ node: id, values: values.slice(), smaller, qualifies: true }) })
    } else {
      verdicts[id] = 'no'
      frames.push({ pythonLine: 14, phase: 'reject', activeLine: L('if smaller is at least k'), message: `${smaller} is below ${k}, so node ${node.val} does not count.`, ...snap({ node: id, values: values.slice(), smaller, qualifies: false }) })
    }
    return values
  }

  if (nodes.length) visit(0)
  frames.push({ pythonLine: 18, phase: 'done', activeLine: L('return count'), message: `${count} node${count === 1 ? '' : 's'} are great enough.`, ...snap({ result: count }) })
  return { input: { tree, k }, nodes, result: count, frames }
}

export const code = `count nodes whose subtree has at least k strictly smaller values
  count = 0
  visit(node) returns the list of values in the subtree of node
    if node is empty then return an empty list
    values = [node value]
    append values of visit(left child) to values
    append values of visit(right child) to values
    smaller = number of values strictly less than node value
    if smaller is at least k then count = count + 1
    return values
  visit(root)
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_great_enough(root, k):
    count = 0
    def visit(node):
        nonlocal count
        if node is None:
            return []
        values = [node.val]
        values += visit(node.left)
        values += visit(node.right)
        smaller = 0
        for v in values:
            if v < node.val:
                smaller += 1
        if smaller >= k:
            count += 1
        return values
    visit(root)
    return count
`
