const CODE_LINES = [
  'counts1 and counts2 are empty maps from letter to count',
  'define collect(node, counts)',
  'if node is a letter then add 1 to counts[letter] and stop',
  'for each child c of node: collect(c, counts)',
  'collect(root1, counts1) and collect(root2, counts2)',
  'return counts1 equals counts2',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `def build_kids(tree):
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


def expression_equivalent(t1, t2):
    def collect(tree, kids, i, counts):
        if tree[i] != "+":
            counts[tree[i]] = counts.get(tree[i], 0) + 1
            return
        for c in kids[i]:
            collect(tree, kids, c, counts)

    counts1, counts2 = {}, {}
    collect(t1, build_kids(t1), 0, counts1)
    collect(t2, build_kids(t2), 0, counts2)
    return counts1 == counts2
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Empty tallies', description: 'Start a letter tally for each tree.' },
  { id: 'visit', label: 'Visit', description: 'Walk into this node.' },
  { id: 'leaf', label: 'Variable', description: 'A letter adds one occurrence to its tally.' },
  { id: 'sum', label: 'Plus', description: 'A plus node adds its two subtrees together.' },
  { id: 'done', label: 'Compare', description: 'Equal tallies mean equal expressions.' },
]

// LeetCode level-order arrays. "+" nodes have two children; letter nodes are leaves.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with t1 and t2 level-order arrays.')
  const { t1, t2 } = input
  for (const tree of [t1, t2]) {
    if (!Array.isArray(tree) || tree.length < 1 || tree.length > 15) throw new Error('Each tree is a level-order array of 1 to 15 entries (visualization cap).')
    if (!tree.every(value => value === null || value === '+' || (typeof value === 'string' && /^[a-z]$/.test(value)))) throw new Error('Entries are "+", a single lowercase letter, or null.')
    if (tree[0] === null) throw new Error('Each tree needs a root.')
    const kids = buildKids(tree)
    for (const i of Object.keys(kids)) {
      if (tree[i] === '+' && kids[i].length !== 2) throw new Error('A "+" node needs two children.')
      if (tree[i] !== '+' && kids[i].length !== 0) throw new Error('A letter is a leaf and has no children.')
    }
  }
  return { t1, t2 }
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

export function buildTrace({ t1, t2 }) {
  const frames = []
  const counts = [new Map(), new Map()]
  const trees = [t1, t2]
  const kidsOf = trees.map(buildKids)
  const frame = (phase, activeLine, pythonLine, tree, node, message) => frames.push({
    phase, activeLine, pythonLine, tree, node, message,
    counts: counts.map(m => new Map(m)), t1, t2, kids: kidsOf,
  })
  frame('start', L('counts1 and counts2 are empty'), P('counts1, counts2 = {}, {}'), -1, -1, 'Both tallies start empty.')
  const collect = (which, i) => {
    const tree = trees[which]
    if (tree[i] !== '+') {
      counts[which].set(tree[i], (counts[which].get(tree[i]) || 0) + 1)
      frame('leaf', L('if node is a letter'), P('counts[tree[i]] = counts.get'), which, i, `Letter ${tree[i]} adds one to tree ${which + 1}.`)
      return
    }
    frame('visit', L('for each child c of node'), P('for c in kids[i]'), which, i, `Plus node ${i} in tree ${which + 1}: visit both sides.`)
    for (const c of kidsOf[which][i]) collect(which, c)
    frame('sum', L('for each child c of node'), P('for c in kids[i]'), which, i, `Plus node ${i} is done; its letters are added together.`)
  }
  collect(0, 0)
  collect(1, 0)
  frame('start', L('collect(root1, counts1)'), P('collect(t1, build_kids(t1)'), -1, -1, 'Both trees are tallied.')
  const letters = [...new Set([...counts[0].keys(), ...counts[1].keys()])].sort()
  const same = letters.length === counts[0].size && letters.every(l => counts[0].get(l) === counts[1].get(l))
  frame('done', L('return counts1 equals counts2'), P('return counts1 == counts2'), -1, -1,
    same ? 'The tallies match: the two expressions are equivalent.' : 'The tallies differ: the expressions are not equivalent.')
  return { input: { t1, t2 }, result: same, frames, letters }
}
