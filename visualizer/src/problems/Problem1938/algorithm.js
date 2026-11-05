// LeetCode 1938: walk the tree from the root, keeping the values on the current root path in a binary trie with counts. A query at a node takes the best XOR against that path, then the node's value is removed when the walk leaves it.
const BITS = 18
// Real implementation, mirrored line for line by the Python code below.
const SOURCE = [
  'function maxGeneticDifference(parents, queries) {',
  '  const n = parents.length',
  '  const root = parents.indexOf(-1)',
  '  const children = Array.from({ length: n }, () => [])',
  '  parents.forEach((p, i) => { if (p !== -1) children[p].push(i) })',
  '  const at = Array.from({ length: n }, () => [])',
  '  queries.forEach(([node, val], qi) => at[node].push([qi, val]))',
  '  const trie = [{ ch: [null, null], count: 0 }]',
  '  const insert = (x, delta) => {',
  '    let cur = 0',
  '    trie[cur].count += delta',
  '    for (let bit = BITS - 1; bit >= 0; bit--) {',
  '      const b = (x >> bit) & 1',
  '      if (trie[cur].ch[b] === null) { trie.push({ ch: [null, null], count: 0 }); trie[cur].ch[b] = trie.length - 1 }',
  '      cur = trie[cur].ch[b]',
  '      trie[cur].count += delta',
  '    }',
  '  }',
  '  const best = val => {',
  '    let cur = 0, res = 0',
  '    for (let bit = BITS - 1; bit >= 0; bit--) {',
  '      const want = 1 - ((val >> bit) & 1)',
  '      const nxt = trie[cur].ch[want]',
  '      if (nxt !== null && trie[nxt].count > 0) { res |= 1 << bit; cur = nxt }',
  '      else cur = trie[cur].ch[1 - want]',
  '    }',
  '    return res',
  '  }',
  '  const answers = new Array(queries.length).fill(0)',
  '  const visit = node => {',
  '    insert(node, 1)',
  '    for (const [qi, val] of at[node]) answers[qi] = best(val)',
  '    for (const child of children[node]) visit(child)',
  '    insert(node, -1)',
  '  }',
  '  visit(root)',
  '  return answers',
  '}',
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def max_genetic_difference(parents, queries):
    n = len(parents)
    root = parents.index(-1)
    children = [[] for _ in range(n)]
    for node in range(n):
        if parents[node] != -1:
            children[parents[node]].append(node)
    at = [[] for _ in range(n)]
    for qi, (node, val) in enumerate(queries):
        at[node].append((qi, val))
    BITS = 18
    trie = [[None, None, 0]]
    def insert(x, delta):
        cur = 0
        trie[cur][2] += delta
        for bit in range(BITS - 1, -1, -1):
            b = (x >> bit) & 1
            if trie[cur][b] is None:
                trie.append([None, None, 0])
                trie[cur][b] = len(trie) - 1
            cur = trie[cur][b]
            trie[cur][2] += delta
    def best(val):
        cur = 0
        res = 0
        for bit in range(BITS - 1, -1, -1):
            want = 1 - ((val >> bit) & 1)
            nxt = trie[cur][want]
            if nxt is not None and trie[nxt][2] > 0:
                res |= 1 << bit
                cur = nxt
            else:
                cur = trie[cur][1 - want]
        return res
    answers = [0] * len(queries)
    def visit(node):
        insert(node, 1)
        for qi, val in at[node]:
            answers[qi] = best(val)
        for child in children[node]:
            visit(child)
        insert(node, -1)
    visit(root)
    return answers
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'enter', label: 'Enter node', description: 'Add the node value to the trie of its root path.' },
  { id: 'query', label: 'Answer queries', description: 'Pick the bits that differ most from the query value.' },
  { id: 'leave', label: 'Leave node', description: 'Remove the node value as the walk leaves it.' },
  { id: 'done', label: 'Result', description: 'Answers for every query.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"parents":[-1,0,0,2],"queries":[[3,1],[1,3]]}.') }
  const { parents, queries } = input || {}
  if (!Array.isArray(parents) || parents.length < 1 || parents.length > 8) throw new Error('parents holds 1 to 8 entries.')
  const roots = parents.filter(p => p === -1).length
  if (roots !== 1) throw new Error('Exactly one node has parent -1.')
  parents.forEach((p, i) => { if (p !== -1 && (!Number.isInteger(p) || p < 0 || p >= parents.length || p === i)) throw new Error('Each parent is another node index.') })
  for (let i = 0; i < parents.length; i++) {
    let v = i, steps = 0
    while (v !== -1 && steps <= parents.length) { v = parents[v]; steps++ }
    if (v !== -1) throw new Error('The parents form a cycle.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries holds 1 to 8 [node, val] pairs.')
  if (!queries.every(q => Array.isArray(q) && q.length === 2 && Number.isInteger(q[0]) && Number.isInteger(q[1]) && q[0] >= 0 && q[0] < parents.length && q[1] >= 0 && q[1] < 64)) throw new Error('Each query is [node, val] with node below n and val below 64.')
  return { parents, queries }
}

const bitsOf = x => x.toString(2).padStart(6, '0')

export function buildTrace({ parents, queries }) {
  const n = parents.length
  const root = parents.indexOf(-1)
  const children = Array.from({ length: n }, () => [])
  parents.forEach((p, i) => { if (p !== -1) children[p].push(i) })
  const at = Array.from({ length: n }, () => [])
  queries.forEach(([node, val], qi) => at[node].push([qi, val]))
  const trie = [{ ch: [null, null], count: 0 }]
  const insert = (x, delta) => {
    let cur = 0
    trie[cur].count += delta
    for (let bit = BITS - 1; bit >= 0; bit--) {
      const b = (x >> bit) & 1
      if (trie[cur].ch[b] === null) { trie.push({ ch: [null, null], count: 0 }); trie[cur].ch[b] = trie.length - 1 }
      cur = trie[cur].ch[b]
      trie[cur].count += delta
    }
  }
  const best = val => {
    let cur = 0, res = 0
    for (let bit = BITS - 1; bit >= 0; bit--) {
      const want = 1 - ((val >> bit) & 1)
      const nxt = trie[cur].ch[want]
      if (nxt !== null && trie[nxt].count > 0) { res |= 1 << bit; cur = nxt }
      else cur = trie[cur].ch[1 - want]
    }
    return res
  }
  const path = []
  const answers = new Array(queries.length).fill(0)
  const frames = []
  const visit = node => {
    path.push(node)
    insert(node, 1)
    frames.push({ phase: 'enter', activeLine: L('insert(node, 1)'), pythonLine: P('insert(node, 1)'), message: `Enter node ${node}: its root path is ${path.join(' → ')}.`, node, path: [...path], answers: [...answers], query: null, pick: null })
    for (const [qi, val] of at[node]) {
      answers[qi] = best(val)
      frames.push({ phase: 'query', activeLine: L('answers[qi] = best(val)'), pythonLine: P('answers[qi] = best(val)'), message: `Query ${qi} with value ${val} at node ${node}: best XOR with the path is ${answers[qi]}.`, node, path: [...path], answers: [...answers], query: [qi, val], pick: answers[qi] })
    }
    for (const child of children[node]) visit(child)
    insert(node, -1)
    path.pop()
    frames.push({ phase: 'leave', activeLine: L('insert(node, -1)'), pythonLine: P('insert(node, -1)'), message: `Leave node ${node}: remove it from the path.`, node, path: [...path], answers: [...answers], query: null, pick: null })
  }
  visit(root)
  frames.push({ phase: 'done', activeLine: L('return answers'), pythonLine: P('return answers'), message: `Answers: ${answers.join(', ')}.`, node: null, path: [], answers: [...answers], query: null, pick: null, result: answers })
  return { input: { parents, queries }, result: answers, frames }
}
