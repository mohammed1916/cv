const MAX_NODES = 15
const SYMBOL = { 0: 'F', 1: 'T', 2: 'OR', 3: 'AND', 4: 'XOR', 5: 'NOT' }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with root and result.')
  if (typeof input.result !== 'boolean') throw new Error('result is true or false.')
  let count = 0
  const walk = node => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) throw new Error('Every node is an object with val and children.')
    count += 1
    if (count > MAX_NODES) throw new Error(`The visualization allows at most ${MAX_NODES} nodes.`)
    const { val } = node
    if (![0, 1, 2, 3, 4, 5].includes(val)) throw new Error('val is 0, 1 (leaves), 2 OR, 3 AND, 4 XOR or 5 NOT.')
    if (val === 0 || val === 1) {
      if (node.left !== undefined || node.right !== undefined) throw new Error('Leaves have no children.')
      return { val }
    }
    if (val === 5) {
      if (!node.left || node.right !== undefined) throw new Error('NOT has exactly one child, under left.')
      return { val, left: walk(node.left) }
    }
    if (!node.left || !node.right) throw new Error('OR, AND and XOR have a left and a right child.')
    return { val, left: walk(node.left), right: walk(node.right) }
  }
  const root = walk(input.root)
  return { root, result: input.result }
}

export const code = `minimum leaf flips so the root evaluates to the requested result
solve(node) returns (cost to make node false, cost to make node true)
  if node is a leaf: its own value costs 0 and the other value costs 1
  if node is NOT: swap the pair of its only child
  if node is OR: false needs both children false; true needs at least one true
  if node is AND: true needs both children true; false needs at least one false
  if node is XOR: false when the children match; true when they differ
return the pair for the root and pick the entry for the requested result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_flips(root, result):
    def solve(node):
        val = node['val']
        if val in (0, 1):
            return (1, 0) if val == 1 else (0, 1)
        if val == 5:
            f, t = solve(node['left'])
            return (t, f)
        lf, lt = solve(node['left'])
        rf, rt = solve(node['right'])
        if val == 2:
            return (lf + rf, min(lt + rt, lt + rf, lf + rt))
        if val == 3:
            return (min(lf + rf, lf + rt, lt + rf), lt + rt)
        return (min(lf + rf, lt + rt), min(lt + rf, lf + rt))
    f, t = solve(root)
    return t if result else f
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const PY_LINES = python.split('\n')
const PL = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

// Assigns ids in preorder so the view can place every node and its pair of costs.
function numberNodes(node, nodes = [], parent = null, side = null) {
  const id = nodes.length
  const entry = { id, val: node.val, parent, side, left: null, right: null, label: SYMBOL[node.val] }
  nodes.push(entry)
  if (node.left) entry.left = numberNodes(node.left, nodes, id, 'left').id
  if (node.right) entry.right = numberNodes(node.right, nodes, id, 'right').id
  return entry
}

export function buildTrace({ root, result }) {
  const nodes = []
  numberNodes(root, nodes)
  const pairs = new Map()
  const frames = []
  const snap = extra => ({
    nodes: nodes.map(n => ({ ...n })), pairs: pairCopy(), result,
    ...extra,
  })
  const pairCopy = () => Object.fromEntries(pairs)

  const solve = (entry) => {
    const { val } = entry
    if (val === 0 || val === 1) {
      const pair = val === 1 ? [1, 0] : [0, 1]
      pairs.set(entry.id, pair)
      frames.push(snap({
        phase: 'leaf', activeLine: L('if node is a leaf'), pythonLine: PL("if val in (0, 1)"),
        node: entry.id, pairs: pairCopy(),
        message: `Leaf ${val} costs ${pair[0]} to make false and ${pair[1]} to make true.`,
      }))
      return pair
    }
    if (val === 5) {
      const [f, t] = solve(nodes[entry.left])
      const pair = [t, f]
      pairs.set(entry.id, pair)
      frames.push(snap({
        phase: 'combine', activeLine: L('if node is NOT'), pythonLine: PL('return (t, f)'),
        node: entry.id, pairs: pairCopy(),
        message: `NOT swaps its child: false costs ${pair[0]}, true costs ${pair[1]}.`,
      }))
      return pair
    }
    const [lf, lt] = solve(nodes[entry.left])
    const [rf, rt] = solve(nodes[entry.right])
    let pair
    let line
    let py
    let note
    if (val === 2) {
      pair = [lf + rf, Math.min(lt + rt, lt + rf, lf + rt)]
      line = L('if node is OR'); py = PL('return (lf + rf, min(lt + rt, lt + rf, lf + rt))')
      note = `OR: false needs both children false (${pair[0]}); true needs one true (${pair[1]}).`
    } else if (val === 3) {
      pair = [Math.min(lf + rf, lf + rt, lt + rf), lt + rt]
      line = L('if node is AND'); py = PL('return (min(lf + rf, lf + rt, lt + rf), lt + rt)')
      note = `AND: true needs both true (${pair[1]}); false needs one false (${pair[0]}).`
    } else {
      pair = [Math.min(lf + rf, lt + rt), Math.min(lt + rf, lf + rt)]
      line = L('if node is XOR'); py = PL('return (min(lf + rf, lt + rt), min(lt + rf, lf + rt))')
      note = `XOR: equal children give false (${pair[0]}); different children give true (${pair[1]}).`
    }
    pairs.set(entry.id, pair)
    frames.push(snap({
      phase: 'combine', activeLine: line, pythonLine: py, node: entry.id, pairs: pairCopy(),
      message: `${SYMBOL[val]} node: ${note}`,
    }))
    return pair
  }

  const [rootF, rootT] = solve(nodes[0])
  const answer = result ? rootT : rootF
  frames.push(snap({
    phase: 'done', activeLine: L('return the pair for the root'), pythonLine: PL('return t if result else f'),
    node: 0, pairs: pairCopy(), answer,
    message: `The root needs ${answer} flip${answer === 1 ? '' : 's'} to evaluate to ${result}.`,
  }))
  return { input: { root: nodes, result }, result: answer, frames }
}

