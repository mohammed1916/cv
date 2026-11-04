const MOD = 1000000007n
export const BLUE = 0
export const RED = 1
export const cardName = card => card === RED ? 'red' : 'blue'
const times = (a, b) => Number(BigInt(a) * BigInt(b) % MOD)
const plus = (a, b) => (a + b) % Number(MOD)

// Row = card held before the climb, column = card held after it. Index 0 is blue, 1 is red.
const multiply = (a, b) => [0, 1].map(i => [0, 1].map(j => plus(times(a[i][0], b[0][j]), times(a[i][1], b[1][j]))))
const applyToWays = (ways, m) => [0, 1].map(j => plus(times(ways[0], m[0][j]), times(ways[1], m[1][j])))

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with parent, gates and queries.')
  const { parent, gates, queries } = input
  if (!Array.isArray(parent) || parent.length < 2 || parent.length > 15) throw new Error('parent has 2 to 15 entries.')
  const n = parent.length
  if (parent[0] !== -1) throw new Error('parent[0] must be -1.')
  if (!parent.slice(1).every(p => Number.isInteger(p) && p >= 0 && p < n)) throw new Error('Each other parent is a node index.')
  for (let start = 1; start < n; start++) {
    let at = start, hops = 0
    while (at !== 0 && hops <= n) { at = parent[at]; hops++ }
    if (at !== 0) throw new Error('parent must form one tree rooted at node 0.')
  }
  if (!Array.isArray(gates) || gates.length !== n) throw new Error('gates has one entry per node.')
  for (const g of gates) {
    if (!Array.isArray(g) || g.length !== 3 || !g.every(v => Number.isInteger(v) && v >= 0 && v <= 10)) throw new Error('Each gates entry is [red, blue, white], each from 0 to 10.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries has 1 to 6 entries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 4 || !q.every(Number.isInteger)) throw new Error('Each query is [aNode, aCard, bNode, bCard].')
    if (q[0] < 0 || q[0] >= n || q[2] < 0 || q[2] >= n) throw new Error('Query nodes must exist.')
    if ((q[1] !== 0 && q[1] !== 1) || (q[3] !== 0 && q[3] !== 1)) throw new Error('Cards are 0 for blue or 1 for red.')
  }
  return { parent, gates, queries }
}

export function buildTrace({ parent, gates, queries }) {
  const n = parent.length
  const levels = Math.max(1, (n - 1).toString(2).length)
  const children = Array.from({ length: n }, () => [])
  for (let v = 1; v < n; v++) children[parent[v]].push(v)
  const depth = Array(n).fill(0)
  const stack = [0]
  while (stack.length) {
    const v = stack.pop()
    for (const c of children[v]) { depth[c] = depth[v] + 1; stack.push(c) }
  }
  const up = Array.from({ length: levels }, () => Array(n).fill(-1))
  const table = Array.from({ length: levels }, () => Array(n).fill(null))
  const order = []
  const frames = []
  let builtCount = 0
  const rows = []
  let answer = 0
  const push = (phase, lineKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(lineKey), pythonLine: P(pyKey), message, builtCount,
    rows: rows.map(r => ({ ...r })), answer, showDepth: false, ...extra,
    ...(extra.q ? { q: { ...extra.q } } : {}),
  })
  push('start', 'read the tree', 'def count_ways', `${n} nodes and ${queries.length} quer${queries.length === 1 ? 'y' : 'ies'}. Each node lists its red, blue and white gates.`)
  push('depth', 'measure each', 'depth[child] = depth[node] + 1', `Depths from the root reach ${Math.max(...depth)}, so ${levels} jump size${levels === 1 ? '' : 's'} (powers of 2) cover any climb.`, { showDepth: true })
  for (let v = 1; v < n; v++) {
    const [red, blue, white] = gates[v]
    up[0][v] = parent[v]
    table[0][v] = [[blue, white], [white, red]]
    order.push({ level: 0, node: v })
    builtCount = order.length
    push('base', 'one step from each', 'table[0][node] = [[blue, white], [white, red]]',
      `Leaving node ${v}: blue card has ${blue} gate${blue === 1 ? '' : 's'} staying blue, ${white} flipping to red; red card has ${red} staying red, ${white} flipping to blue.`,
      { showDepth: true, cell: { level: 0, node: v }, jump: { from: v, to: parent[v] } })
  }
  for (let j = 1; j < levels; j++) {
    for (let v = 0; v < n; v++) {
      const mid = up[j - 1][v]
      if (mid === -1 || up[j - 1][mid] === -1) continue
      up[j][v] = up[j - 1][mid]
      table[j][v] = multiply(table[j - 1][v], table[j - 1][mid])
      order.push({ level: j, node: v })
      builtCount = order.length
      push('lift', 'double the jump', 'table[j][node] = multiply(table[j - 1][node], table[j - 1][mid])',
        `A ${2 ** j}-step jump from ${v} is ${2 ** (j - 1)} steps to ${mid}, then ${2 ** (j - 1)} more to ${up[j][v]}: multiply the two matrices.`,
        { showDepth: true, cell: { level: j, node: v }, sources: [{ level: j - 1, node: v }, { level: j - 1, node: mid }], jump: { from: v, to: up[j][v] } })
    }
  }
  queries.forEach(([aNode, aCard, bNode, bCard], qi) => {
    const q = { index: qi, aNode, aCard, bNode, bCard }
    const base = { showDepth: true, q }
    push('query', 'for each query', 'for a, card_a, b, card_b in queries:',
      `Query ${qi}: Alice at ${aNode} with a ${cardName(aCard)} card, Bob at ${bNode} with a ${cardName(bCard)} card.`, base)
    let a = aNode, b = bNode
    if (depth[a] < depth[b]) [a, b] = [b, a]
    const gap = depth[a] - depth[b]
    push('lca', 'level the two', 'gap = depth[a] - depth[b]', `Depths differ by ${gap}, so lift the deeper pointer ${gap} step${gap === 1 ? '' : 's'} first.`, { ...base, ptr: [a, b] })
    for (let j = 0; j < levels; j++) {
      if (gap >> j & 1) {
        const from = a
        a = up[j][a]
        push('lca', 'level the two', 'a = up[j][a]', `Lift ${from} by ${2 ** j} to ${a}.`, { ...base, ptr: [a, b], jump: { from, to: a } })
      }
    }
    const metAfterLevel = a === b
    if (a !== b) {
      for (let j = levels - 1; j >= 0; j--) {
        if (up[j][a] !== up[j][b]) {
          const fa = a, fb = b
          a = up[j][a]; b = up[j][b]
          push('lca', 'jump both', 'a, b = up[j][a], up[j][b]', `Their ${2 ** j}-step ancestors differ, so both jump: ${fa} to ${a}, ${fb} to ${b}.`, { ...base, ptr: [a, b], jump: { from: fa, to: a }, jump2: { from: fb, to: b } })
        }
      }
      a = up[0][a]
    }
    const top = a
    q.top = top
    push('lca', 'jump both', metAfterLevel ? 'return a' : 'return up[0][a]',
      `The lowest common ancestor is node ${top}.`, { ...base, ptr: [top, top] })

    const climb = (who, start, card) => {
      const steps = depth[start] - depth[top]
      let node = start
      let ways = [0, 0]
      ways[card] = 1
      const lineFor = { showDepth: true, q, who, card, start }
      push('climb', 'start the climb', 'ways[card] = 1', steps === 0
        ? `${who} is already at node ${top}: exactly 1 way, no gate used.`
        : `${who} climbs ${steps} step${steps === 1 ? '' : 's'}. Binary ${steps.toString(2)} says which jumps to use. Start with 1 way holding ${cardName(card)}.`,
      { ...lineFor, at: node, ways: [...ways], steps })
      for (let j = 0; j < levels; j++) {
        if (steps >> j & 1) {
          const matrix = table[j][node]
          const before = ways
          const from = node
          ways = applyToWays(ways, matrix)
          node = up[j][node]
          push('climb', 'apply each', 'ways = [ways[0] * jump[0][0] + ways[1] * jump[1][0], ways[0] * jump[0][1] + ways[1] * jump[1][1]]',
            `Jump ${2 ** j} from ${from} to ${node}: ${before[BLUE]} blue and ${before[RED]} red become ${ways[BLUE]} blue and ${ways[RED]} red.`,
            { ...lineFor, at: node, ways: [...ways], before, matrix, steps, cell: { level: j, node: from }, jump: { from, to: node } })
        }
      }
      const total = plus(ways[0], ways[1])
      push('climb', 'count both', 'return (ways[0] + ways[1]) % MOD', `${who} finishes at node ${top}, with ${ways[BLUE]} blue + ${ways[RED]} red = ${total} way${total === 1 ? '' : 's'}.`, { ...lineFor, at: node, ways: [...ways], steps, total })
      return total
    }
    const alice = climb('Alice', aNode, aCard)
    q.alice = alice
    const bob = climb('Bob', bNode, bCard)
    q.bob = bob
    const product = times(alice, bob)
    answer ^= product
    rows.push({ query: qi, Alice: `${aNode} ${cardName(aCard)}`, Bob: `${bNode} ${cardName(bCard)}`, LCA: top, 'Alice ways': alice, 'Bob ways': bob, product, 'XOR so far': answer })
    push('combine', 'multiply Alice', 'answer ^= alice * bob % MOD', `The two climbs are independent: ${alice} × ${bob} = ${product}. XOR so far is ${answer}.`, base)
  })
  push('done', 'return the XOR', 'return answer', `Return ${answer}.`, { showDepth: true })
  return { input: { parent, gates, queries }, result: answer, frames, lift: { levels, up, table, order, depth, children } }
}

export const phases = [
  { id: 'start', label: 'Start', description: 'The tree and its gates.' },
  { id: 'depth', label: 'Depth', description: 'Depths give the length of each climb.' },
  { id: 'base', label: 'One step', description: 'A 2 by 2 matrix counts gates by card before and after leaving a node.' },
  { id: 'lift', label: 'Double', description: 'Multiply two half jumps to get a jump twice as long.' },
  { id: 'query', label: 'Query', description: 'Where Alice and Bob start.' },
  { id: 'lca', label: 'Find LCA', description: 'Level the depths, then jump together until they meet.' },
  { id: 'climb', label: 'Climb', description: 'Push the way counts through the jump matrices.' },
  { id: 'combine', label: 'Combine', description: 'Multiply the two counts and XOR into the answer.' },
  { id: 'done', label: 'Result', description: 'The XOR of every query value.' },
]

export const code = `read the tree and its gates
measure each node's depth from the root
one step from each node: matrix of gates by card before and after
double the jump: a 2^j matrix is two 2^(j-1) matrices multiplied
for each query
  level the two pointers to the same depth
  jump both while their ancestors differ; the parent is the LCA
  start the climb with 1 way holding the starting card
  apply each binary jump of the distance to the way counts
  count both card colours at the LCA
  multiply Alice's and Bob's counts and XOR it in
return the XOR`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `MOD = 10 ** 9 + 7


def multiply(x, y):
    return [[(x[i][0] * y[0][j] + x[i][1] * y[1][j]) % MOD for j in range(2)] for i in range(2)]


def count_ways(parent, gates, queries):
    n = len(parent)
    levels = max(1, (n - 1).bit_length())
    children = [[] for _ in range(n)]
    for node in range(1, n):
        children[parent[node]].append(node)
    depth = [0] * n
    stack = [0]
    while stack:
        node = stack.pop()
        for child in children[node]:
            depth[child] = depth[node] + 1
            stack.append(child)

    up = [[-1] * n for _ in range(levels)]
    table = [[None] * n for _ in range(levels)]
    for node in range(1, n):
        red, blue, white = gates[node]
        up[0][node] = parent[node]
        table[0][node] = [[blue, white], [white, red]]
    for j in range(1, levels):
        for node in range(n):
            mid = up[j - 1][node]
            if mid == -1 or up[j - 1][mid] == -1:
                continue
            up[j][node] = up[j - 1][mid]
            table[j][node] = multiply(table[j - 1][node], table[j - 1][mid])

    def lca(a, b):
        if depth[a] < depth[b]:
            a, b = b, a
        gap = depth[a] - depth[b]
        for j in range(levels):
            if gap >> j & 1:
                a = up[j][a]
        if a == b:
            return a
        for j in reversed(range(levels)):
            if up[j][a] != up[j][b]:
                a, b = up[j][a], up[j][b]
        return up[0][a]

    def climb(node, card, steps):
        ways = [0, 0]
        ways[card] = 1
        for j in range(levels):
            if steps >> j & 1:
                jump = table[j][node]
                ways = [ways[0] * jump[0][0] + ways[1] * jump[1][0], ways[0] * jump[0][1] + ways[1] * jump[1][1]]
                node = up[j][node]
        return (ways[0] + ways[1]) % MOD

    answer = 0
    for a, card_a, b, card_b in queries:
        top = lca(a, b)
        alice = climb(a, card_a, depth[a] - depth[top])
        bob = climb(b, card_b, depth[b] - depth[top])
        answer ^= alice * bob % MOD
    return answer
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(t => t.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
