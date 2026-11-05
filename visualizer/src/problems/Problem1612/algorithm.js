// Two expression trees with only '+' are equivalent when their leaf letters occur equally often.
const JS_LINES = [
  { text: 'const counts = new Map()', py: 'counts = {}' },
  { text: 'for (const leaf of leaves(root1)) {', py: 'for leaf in leaf_letters(root1)' },
  { text: 'counts.set(leaf, (counts.get(leaf) ?? 0) + 1)', py: 'counts[leaf] = counts.get(leaf, 0) + 1' },
  { text: '}', py: null },
  { text: 'for (const leaf of leaves(root2)) {', py: 'for leaf in leaf_letters(root2)' },
  { text: 'counts.set(leaf, (counts.get(leaf) ?? 0) - 1)', py: 'counts[leaf] = counts.get(leaf, 0) - 1' },
  { text: '}', py: null },
  { text: 'return [...counts.values()].every(v => v === 0)', py: 'return all(' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def checkEquivalence(root1, root2):
    counts = {}
    for leaf in leaf_letters(root1):
        counts[leaf] = counts.get(leaf, 0) + 1
    for leaf in leaf_letters(root2):
        counts[leaf] = counts.get(leaf, 0) - 1
    return all(v == 0 for v in counts.values())

def children(tree):
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
    return kids

def leaf_letters(tree):
    kids = children(tree)
    out = []
    stack = [0]
    while stack:
        p = stack.pop()
        if not kids[p]:
            out.append(tree[p])
        else:
            stack.extend(reversed(kids[p]))
    return out
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return all(')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty tally of leaf letters.' },
  { id: 'tree1', label: 'Tree 1', description: 'Each leaf of the first tree adds one to its letter.' },
  { id: 'tree2', label: 'Tree 2', description: 'Each leaf of the second tree takes one away from its letter.' },
  { id: 'done', label: 'Result', description: 'Equivalent exactly when every letter nets to zero.' },
]

export const examples = [
  { label: 'Reordered sum', input: '{"root1":["+","x","+",null,null,"y","z"],"root2":["+","+","z","y","x"]}' },
  { label: 'Different letter', input: '{"root1":["+","x","+",null,null,"y","z"],"root2":["+","+","z","y","y"]}' },
  { label: 'Single letters', input: '{"root1":["x"],"root2":["x"]}' },
]

export const complexity = 'O(n) time and O(n) space for two trees with n nodes in total. The visual caps each tree at 15 positions.'

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

function checkTree(tree, name) {
  if (!Array.isArray(tree) || tree.length < 1 || tree.length > 15 || tree[0] === null) throw new Error(`${name} is a level-order array of 1 to 15 entries starting with a node.`)
  const kids = buildKids(tree)
  tree.forEach((value, p) => {
    if (value === null) return
    if (value === '+' && kids[p].length !== 2) throw new Error(`${name}: a "+" node needs two children.`)
    if (value !== '+' && !/^[a-z]$/.test(value)) throw new Error(`${name}: nodes are "+" or a lowercase letter.`)
    if (value !== '+' && kids[p].length !== 0) throw new Error(`${name}: a letter is a leaf.`)
  })
  return kids
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with root1 and root2.')
  checkTree(input.root1, 'root1')
  checkTree(input.root2, 'root2')
  return { root1: input.root1, root2: input.root2 }
}

function leafOrder(tree) {
  const kids = buildKids(tree)
  const out = []
  const stack = [0]
  while (stack.length) {
    const p = stack.pop()
    if (!kids[p].length) out.push(p)
    else stack.push(...[...kids[p]].reverse())
  }
  return out
}

export function buildTrace({ root1, root2 }) {
  const frames = []
  const counts = {}
  const snap = extra => ({ counts: { ...counts }, ...extra })
  const tally = letter => Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' ')
  frames.push({ phase: 'start', activeLine: 1, tree: 0, message: 'The tally starts empty.', snapshot: snap({}) })
  let order = leafOrder(root1)
  for (const p of order) {
    const letter = root1[p]
    counts[letter] = (counts[letter] ?? 0) + 1
    frames.push({ phase: 'tree1', activeLine: 3, tree: 1, position: p, message: `Leaf ${letter} in tree 1 adds one.`, snapshot: snap({ tally: tally() }) })
  }
  order = leafOrder(root2)
  for (const p of order) {
    const letter = root2[p]
    counts[letter] = (counts[letter] ?? 0) - 1
    frames.push({ phase: 'tree2', activeLine: 6, tree: 2, position: p, message: `Leaf ${letter} in tree 2 takes one away.`, snapshot: snap({ tally: tally() }) })
  }
  const equivalent = Object.values(counts).every(v => v === 0)
  const nets = Object.entries(counts).filter(([, v]) => v !== 0).map(([k]) => k)
  frames.push({ phase: 'done', activeLine: 8, tree: 0, result: equivalent, message: equivalent ? 'Every letter nets to zero: equivalent.' : `Letters ${nets.join(', ')} do not balance: not equivalent.`, snapshot: snap({ result: equivalent }) })
  return { input: { root1, root2 }, result: equivalent, counts: { ...counts }, frames }
}
