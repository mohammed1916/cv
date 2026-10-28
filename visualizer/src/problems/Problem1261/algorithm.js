import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.tree) || data.tree.length < 1 || data.tree.length > 64 || data.tree[0] === null) throw new Error('Use tree as a level-order array with a non-null root; every value is -1.')
  if (data.tree.filter(v => v !== null).length > 15) throw new Error('Use at most 15 nodes.')
  if (data.tree.some(v => v !== null && v !== -1)) throw new Error('Every value in a contaminated tree is -1.')
  if (!Array.isArray(data.targets) || data.targets.length < 1 || data.targets.length > 15 || data.targets.some(t => !Number.isInteger(t) || t < 0 || t > 1000)) throw new Error('Use 1 to 15 targets, each an integer from 0 to 1000.')
  return { tree: data.tree, targets: data.targets }
}

export function buildTrace({ tree, targets }) {
  const root = treeFromLevelOrder(tree)
  const tags = {}
  const values = new Set()
  const frames = [{ phase: 'start', activeLine: L('set the root value to zero'), node: null, tags: {}, found: null, results: [], message: 'Every value is contaminated. Recover them from positions, starting at 0 for the root.' }]
  const stack = root ? [{ node: root, value: 0, side: null }] : []
  while (stack.length) {
    const { node, value, side } = stack.pop()
    tags[node.id] = String(value)
    values.add(value)
    const line = side === null ? 'set the root value to zero' : side === 'left' ? 'give the left child' : 'give the right child'
    frames.push({ phase: 'recover', activeLine: L(line), node: node.id, tags: { ...tags }, found: null, results: [], message: `This position is worth ${value}.` })
    if (node.left) stack.push({ node: node.left, value: 2 * value + 1, side: 'left' })
    if (node.right) stack.push({ node: node.right, value: 2 * value + 2, side: 'right' })
  }
  frames.push({ phase: 'collect', activeLine: L('collect every recovered value'), node: null, tags: { ...tags }, found: null, results: [], message: `Recovered values: ${[...values].sort((a, b) => a - b).join(', ')}.` })
  const results = []
  for (const t of targets) {
    const found = values.has(t)
    results.push(found)
    frames.push({ phase: 'find', activeLine: L('for each target, record'), node: null, tags: { ...tags }, found, target: t, results: [...results], message: `${t} ${found ? 'is' : 'is not'} in the recovered tree.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the list of answers'), node: null, tags: { ...tags }, found: null, results: [...results], result: results, message: `Answers: [${results.join(', ')}].` })
  return { input: { tree, targets }, root, result: results, frames }
}

export const code = `find which targets exist in the recovered tree
  set the root value to zero
  for each node from the top down
    give the left child twice the parent value plus one
    give the right child twice the parent value plus two
  collect every recovered value into a set
  for each target, record whether it is in the set
  return the list of answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_in_contaminated_tree(tree, targets):
    def build(arr):
        if not arr or arr[0] is None:
            return None
        top = [None, None]
        queue = [top]
        cursor = 1
        for slot in queue:
            if cursor < len(arr) and arr[cursor] is not None:
                slot[0] = [None, None]
                queue.append(slot[0])
            cursor += 1
            if cursor < len(arr) and arr[cursor] is not None:
                slot[1] = [None, None]
                queue.append(slot[1])
            cursor += 1
        return top

    top = build(tree)
    values = set()
    if top is None:
        return [False for _ in targets]
    stack = [(top, 0)]
    while stack:
        current, value = stack.pop()
        values.add(value)
        if current[0] is not None:
            stack.append((current[0], 2 * value + 1))
        if current[1] is not None:
            stack.append((current[1], 2 * value + 2))
    return [t in values for t in targets]
`
