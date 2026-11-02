const CODE_LINES = [
  'queue holds the root',
  'while the queue is not empty',
  'level is the list of nodes currently in the queue',
  'for each node at index i in level',
  'if node is u then return the next node in level, or null if u is last',
  'replace the queue with the children of level, left to right',
  'return null',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `def find_nearest_right(tree, u):
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
    queue = [0]
    while queue:
        level = queue
        for i, node in enumerate(level):
            if node == u:
                return level[i + 1] if i + 1 < len(level) else None
        queue = [c for node in level for c in kids[node]]
    return None
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'level', label: 'Level', description: 'Read the nodes of the current level, left to right.' },
  { id: 'scan', label: 'Scan', description: 'Compare this node with u.' },
  { id: 'found', label: 'Found u', description: 'u is on this level; its right neighbour is the answer.' },
  { id: 'last', label: 'Rightmost', description: 'u is the last node of its level.' },
  { id: 'down', label: 'Next level', description: 'Move to the children, left to right.' },
  { id: 'done', label: 'Result', description: 'Report the nearest right node, or null.' },
]

// LeetCode level-order array: positions are the node references used by u.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with tree and u.')
  const { tree, u } = input
  if (!Array.isArray(tree) || tree.length < 1 || tree.length > 15 || tree[0] === null) throw new Error('tree is a level-order array of 1 to 15 entries starting with a non-null root (visualization cap).')
  if (!tree.every(value => value === null || (Number.isInteger(value) && value >= 0 && value <= 9))) throw new Error('Tree values are integers from 0 to 9 (visualization cap).')
  buildKids(tree)
  if (!Number.isInteger(u) || u < 0 || u >= tree.length || tree[u] === null) throw new Error('u is the array position of a non-null node.')
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
  let level = [0]
  let result = null
  let done = false
  const frame = (phase, activeLine, pythonLine, node, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, node, message, level: [...level], u, tree, kids, result, ...extra,
  })
  while (level.length && !done) {
    frame('level', L('level is the list of nodes'), P('level = queue'), -1, `Level holds [${level.join(', ')}] (positions).`)
    for (let i = 0; i < level.length && !done; i++) {
      const node = level[i]
      frame('scan', L('for each node at index i'), P('for i, node in enumerate(level)'), node, `Position ${node} (value ${tree[node]}) ${node === u ? 'is' : 'is not'} u.`, { index: i })
      if (node === u) {
        done = true
        if (i + 1 < level.length) {
          result = level[i + 1]
          frame('found', L('if node is u then return'), P('return level[i + 1]'), node, `u is at index ${i}; its right neighbour is position ${result} (value ${tree[result]}).`, { index: i, result })
        } else {
          result = null
          frame('last', L('if node is u then return'), P('return None'), node, `u is the rightmost node of its level, so the answer is null.`, { index: i, result: null })
        }
      }
    }
    if (done) break
    level = level.flatMap(node => kids[node])
    if (level.length) frame('down', L('replace the queue'), P('queue = [c for node'), -1, `Next level: [${level.join(', ')}].`)
  }
  frame('done', L('return null'), P('return None'), -1, result === null ? 'No node to the right: null.' : `Answer is position ${result}, value ${tree[result]}.`, { result })
  return { input: { tree, u }, result, frames }
}
