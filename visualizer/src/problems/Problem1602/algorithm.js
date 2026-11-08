// Nearest right node: breadth-first search by level; the node after u on the same level is the answer.
const JS_LINES = [
  { text: 'const kids = buildKids(tree)', py: 'kids = {}' },
  { text: 'let level = [0]', py: 'level = [0]' },
  { text: 'while (level.length > 0) {', py: 'while level' },
  { text: 'for (let i = 0; i < level.length; i++) {', py: 'for i, p in enumerate' },
  { text: 'if (tree[level[i]] === u) return i + 1 < level.length ? tree[level[i + 1]] : null', py: 'if tree[p] == u' },
  { text: '}', py: null },
  { text: 'level = level.flatMap(p => kids[p])', py: 'level = [c' },
  { text: '}', py: null },
  { text: 'return null', py: 'return None' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def findNearestRightNode(tree, u):
    kids = {}
    order = [0]
    nxt = 1
    for i in order:
        kids[i] = []
        for _ in range(2):
            if nxt < len(tree):
                if tree[nxt] is not None:
                    kids[i].append(nxt)
                    order.append(nxt)
                nxt += 1
    level = [0]
    while level:
        for i, p in enumerate(level):
            if tree[p] == u:
                return tree[level[i + 1]] if i + 1 < len(level) else None
        level = [c for p in level for c in kids[p]]
    return None
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return None')]))

export const phases = [
  { id: 'level', label: 'Level', description: 'List the nodes of the current level, left to right.' },
  { id: 'scan', label: 'Scan', description: 'Compare each node in the level with u.' },
  { id: 'found', label: 'Found u', description: 'u has a node to its right on this level: that node is the answer.' },
  { id: 'last', label: 'Rightmost', description: 'u is the last node of its level, so the answer is null.' },
  { id: 'down', label: 'Next level', description: 'Move on to the children of this level, left to right.' },
  { id: 'done', label: 'Result', description: 'Report the nearest right node value, or null.' },
]

export const examples = [
  { label: 'Right neighbour', input: '{"tree":[5,3,8,1,4,null,9],"u":4}' },
  { label: 'Rightmost on level', input: '{"tree":[5,3,8,1,4,null,9],"u":8}' },
  { label: 'Root alone', input: '{"tree":[7],"u":7}' },
    { label: "Right neighbour on a full level", input: "{\"tree\":[1,2,3,4,5,6,7],\"u\":5}" },
    { label: "Right neighbour at a deeper level", input: "{\"tree\":[50,20,70,10,30,60,80,5,15,25,35,55,65,75,85],\"u\":35}" },
    { label: "Rightmost on a full level", input: "{\"tree\":[1,2,3,4,5,6,7],\"u\":7}" },
    { label: "Long run: fifteen nodes", input: "{\"tree\":[9,5,28,88,null,64,38,83,16,null,71,32,72,40,89],\"u\":83}" },
]

export const complexity = 'O(n) time and O(w) space for n nodes and the widest level w. The visual caps the tree at 15 positions with distinct values 1 to 99.'

// LeetCode level-order array: a null marks a missing child. Positions are used as node references.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with tree and u.')
  const { tree, u } = input
  if (!Array.isArray(tree) || tree.length < 1 || tree.length > 15 || tree[0] === null) throw new Error('tree is a level-order array of 1 to 15 entries starting with a non-null root (visual cap).')
  if (!tree.every(value => value === null || (Number.isInteger(value) && value >= 1 && value <= 99))) throw new Error('Values are integers from 1 to 99 (visual cap).')
  const present = tree.filter(value => value !== null)
  if (new Set(present).size !== present.length) throw new Error('Values in the tree are distinct.')
  buildKids(tree)
  if (!present.includes(u)) throw new Error('u is a value present in the tree.')
  return { tree, u }
}

export function buildKids(tree) {
  const kids = {}
  const order = [0]
  let next = 1
  for (let p = 0; p < order.length; p++) {
    const i = order[p]
    kids[i] = []
    for (let side = 0; side < 2; side++) {
      if (next < tree.length) {
        if (tree[next] !== null) {
          kids[i].push(next)
          order.push(next)
        }
        next++
      }
    }
  }
  if (order.length !== tree.filter(value => value !== null).length) throw new Error('tree is not a valid level-order array.')
  return kids
}

export function buildTrace({ tree, u }) {
  const kids = buildKids(tree)
  const frames = []
  const levels = []
  let level = [0]
  let result = null
  let done = false
  const snap = extra => ({ u, ...extra })
  const frame = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message, level: [...level], levels, u, tree, kids, result, snapshot: snap({ result }), ...extra,
  })
  while (level.length && !done) {
    levels.push([...level])
    frame('level', 3, `Level holds values [${level.map(p => tree[p]).join(', ')}].`)
    for (let i = 0; i < level.length && !done; i++) {
      const node = level[i]
      frame('scan', 5, `Value ${tree[node]} ${tree[node] === u ? 'is' : 'is not'} u.`, { index: i, scanning: node })
      if (tree[node] === u) {
        done = true
        if (i + 1 < level.length) {
          result = tree[level[i + 1]]
          frame('found', 5, `u sits at index ${i}; its right neighbour is ${result}.`, { index: i, result })
        } else {
          result = null
          frame('last', 5, 'u is the rightmost node of its level, so the answer is null.', { index: i, result: null })
        }
      }
    }
    if (done) break
    level = level.flatMap(node => kids[node])
    if (level.length) frame('down', 7, `Next level: [${level.map(p => tree[p]).join(', ')}].`)
  }
  frame('done', 9, result === null ? 'No node to the right: null.' : `Answer is ${result}.`, { result })
  return { input: { tree, u }, result, levels, frames }
}
