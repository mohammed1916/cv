export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with edges, nums and k.')
  const { edges, nums, k } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 14) throw new Error('nums has 2 to 14 entries in this visualization.')
  for (const value of nums) {
    if (!Number.isInteger(value) || Math.abs(value) > 40000) throw new Error('Each entry of nums is between -40000 and 40000.')
  }
  if (!Number.isInteger(k) || k < 1 || k > 50) throw new Error('k is 1 to 50.')
  const n = nums.length
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges has exactly n - 1 pairs.')
  const seen = new Set([0])
  const graph = Array.from({ length: n }, () => [])
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 0 && v < n) || edge[0] === edge[1]) throw new Error('Each edge joins two different nodes from 0 to n - 1.')
    graph[edge[0]].push(edge[1])
    graph[edge[1]].push(edge[0])
  }
  const queue = [0]
  for (const v of queue) for (const w of graph[v]) if (!seen.has(w)) { seen.add(w); queue.push(w) }
  if (seen.size !== n) throw new Error('edges must connect all nodes into one tree.')
  return { edges, nums, k }
}

export const phases = [
  { id: 'root', label: 'Root', description: 'Hang the tree from node 0 and plan to process children first.' },
  { id: 'visit', label: 'Node', description: 'All children of this node are solved.' },
  { id: 'own', label: 'Keep', description: 'Without inverting this node, its value keeps the sign from above.' },
  { id: 'merge', label: 'Merge', description: 'Join a child while keeping any two inverted nodes far enough apart.' },
  { id: 'invert', label: 'Invert', description: 'Invert this node: nothing below may sit closer than k.' },
  { id: 'table', label: 'Table', description: 'This row of the table is complete.' },
  { id: 'done', label: 'Result', description: 'Read the best value at the root with no inversion above it.' },
]

export const code = `maximum total after inversions at least k apart
  root the tree at 0 and process each child before its parent
  for each node v, for both signs from the inversions above it
    if v is kept, it contributes its value with that sign
    for each child, move its nearest inverted node one edge closer to the top, then
      merge: two branches fit when their nearest distances add up to at least k
    if v is inverted, it flips the sign, and each child needs nearest distance at least k - 1
  answer is the best entry at the root with no inversion above`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def subtree_inversion(edges, nums, k):
    n = len(nums)
    k = min(k, n)
    NONE = float('-inf')
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    parent = [-1] * n
    order = [0]
    for v in order:
        for w in graph[v]:
            if w != parent[v]:
                parent[w] = v
                order.append(w)

    def shifted(row):
        out = [NONE] * (k + 1)
        for d, value in enumerate(row):
            near = min(d + 1, k)
            out[near] = max(out[near], value)
        return out

    def best_from(row):
        out = row[:]
        for d in range(k - 1, -1, -1):
            out[d] = max(out[d], out[d + 1])
        return out

    def merged(a, b):
        best_a, best_b = best_from(a), best_from(b)
        out = [NONE] * (k + 1)
        for d in range(k + 1):
            other = max(d, k - d)
            out[d] = max(a[d] + best_b[other], b[d] + best_a[other])
        return out

    dp = [None] * n
    for v in reversed(order):
        kids = [w for w in graph[v] if w != parent[v]]
        table = []
        for flips in (0, 1):
            sign = -1 if flips else 1
            keep = [NONE] * (k + 1)
            keep[k] = sign * nums[v]
            invert = -sign * nums[v]
            for c in kids:
                keep = merged(keep, shifted(dp[c][flips]))
                invert += max(dp[c][1 - flips][k - 1:])
            keep[0] = invert
            table.append(keep)
        dp[v] = table
    return max(dp[0][0])
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

const NONE = -Infinity

function shifted(row, K) {
  const out = Array(K + 1).fill(NONE)
  row.forEach((value, d) => {
    const near = Math.min(d + 1, K)
    out[near] = Math.max(out[near], value)
  })
  return out
}

function bestFrom(row) {
  const out = [...row]
  for (let d = out.length - 2; d >= 0; d--) out[d] = Math.max(out[d], out[d + 1])
  return out
}

function merged(a, b, K) {
  const bestA = bestFrom(a), bestB = bestFrom(b)
  const out = Array(K + 1).fill(NONE)
  for (let d = 0; d <= K; d++) {
    const other = Math.max(d, K - d)
    out[d] = Math.max(a[d] + bestB[other], b[d] + bestA[other])
  }
  return out
}

const shown = row => row.map(value => (value === NONE ? null : value))

// -Infinity cannot travel through JSON-shaped frames, so unreachable entries become null.
function matrixFor(a, b, K) {
  return a.map((x, d1) => b.map((y, d2) => {
    if (x === NONE || y === NONE) return { kind: 'none', value: null }
    if (d1 + d2 < K) return { kind: 'close', value: null }
    return { kind: 'ok', value: x + y }
  }))
}

export function buildTrace({ edges, nums, k }) {
  const n = nums.length
  const K = Math.min(k, n)
  const graph = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u) }
  const parent = Array(n).fill(-1)
  const order = [0]
  for (const v of order) for (const w of graph[v]) if (w !== parent[v]) { parent[w] = v; order.push(w) }
  const kids = graph.map((list, v) => list.filter(w => w !== parent[v]))

  // Descendants of v with their edge distance from v, v included.
  const below = v => {
    const out = [{ node: v, dist: 0 }]
    for (const item of out) for (const c of kids[item.node]) out.push({ node: c, dist: item.dist + 1 })
    return out
  }
  const treeOf = v => ({ id: v, children: kids[v].map(treeOf) })
  const tree = treeOf(0)

  const dp = Array(n).fill(null)
  const steps = Array.from({ length: n }, () => [null, null])
  const solved = []
  const frames = []
  const base = { v: -1, flips: 0, child: -1, keep: null, table: null, childRow: null, matrix: null, blocked: [], subtree: [], solved: [], inverted: null, finalValues: null }
  frames.push({ ...base, phase: 'root', activeLine: L('root the tree'), pythonLine: P('for v in order'), order: [...order], message: `Children come before parents: process ${[...order].reverse().join(', ')}.${k > K ? ` No two of the ${n} nodes can be ${n} or more edges apart, so k = ${k} acts exactly like k = ${K}.` : ''} Distances of ${K} or more are all treated alike in the tables.` })

  for (const v of [...order].reverse()) {
    const subtree = below(v).map(item => item.node)
    const table = [null, null]
    const snap = () => table.map(row => (row ? shown(row) : null))
    const done = () => [...solved]
    frames.push({ ...base, phase: 'visit', activeLine: L('for each node v'), pythonLine: P('for v in reversed(order)'), v, subtree, solved: done(), table: snap(), message: kids[v].length ? `Node ${v} has value ${nums[v]} and solved children ${kids[v].join(', ')}.` : `Node ${v} has value ${nums[v]} and is a leaf.` })
    for (const flips of [0, 1]) {
      const sign = flips ? -1 : 1
      let keep = Array(K + 1).fill(NONE)
      keep[K] = sign * nums[v]
      let invert = -sign * nums[v]
      const merges = []
      frames.push({ ...base, phase: 'own', activeLine: L('if v is kept'), pythonLine: P('keep[k] = sign * nums[v]'), v, flips, subtree, solved: done(), table: snap(), keep: shown(keep), message: `${flips ? 'An odd number of inversions above' : 'An even number of inversions above'}: kept node ${v} contributes ${sign * nums[v]} and has no inverted node below yet.` })
      for (const c of kids[v]) {
        const childRow = shifted(dp[c][flips], K)
        const before = keep
        keep = merged(keep, childRow, K)
        merges.push({ child: c, before, childRow, after: keep })
        frames.push({ ...base, phase: 'merge', activeLine: L('merge: two branches'), pythonLine: P('keep = merged(keep, shifted'), v, flips, child: c, subtree, solved: done(), table: snap(), keep: shown(keep), before: shown(before), childRow: shown(childRow), matrix: matrixFor(before, childRow, K), message: `Merge child ${c}. A pair of nearest distances works only if they add up to at least ${K}; each result column keeps the best pair whose smaller distance is that column.` })
        const usable = Math.max(...dp[c][1 - flips].slice(K - 1))
        invert += usable
      }
      keep = [...keep]
      keep[0] = invert
      steps[v][flips] = { merges, invert }
      const blocked = below(v).filter(item => item.dist > 0 && item.dist < K).map(item => item.node)
      frames.push({ ...base, phase: 'invert', activeLine: L('if v is inverted'), pythonLine: P('keep[0] = invert'), v, flips, subtree, blocked, solved: done(), table: snap(), keep: shown(keep), inverting: true, invert, message: `Invert node ${v}: its value becomes ${-sign * nums[v]}, and the marked nodes closer than ${K} cannot be inverted. Best total for this subtree: ${invert}.` })
      table[flips] = keep
      frames.push({ ...base, phase: 'table', activeLine: L('if v is inverted'), pythonLine: P('table.append(keep)'), v, flips, subtree, solved: done(), table: snap(), keep: shown(keep), message: `Row for ${flips ? 'an odd' : 'an even'} count of inversions above node ${v} is complete.` })
    }
    dp[v] = table
    solved.push(v)
  }

  const result = Math.max(...dp[0][0])

  // Recover one optimal choice of nodes to invert.
  const inverted = []
  const decide = (v, flips, d) => {
    if (d === 0) {
      inverted.push(v)
      for (const c of kids[v]) {
        const row = dp[c][1 - flips]
        let bestD = K - 1
        for (let x = K - 1; x <= K; x++) if (row[x] > row[bestD]) bestD = x
        decide(c, 1 - flips, bestD)
      }
      return
    }
    const { merges } = steps[v][flips]
    let want = d
    for (let index = merges.length - 1; index >= 0; index--) {
      const { child, before, childRow, after } = merges[index]
      let pick = null
      for (let d1 = 0; d1 <= K && !pick; d1++) for (let d2 = 0; d2 <= K && !pick; d2++) {
        if (Math.min(d1, d2) === want && d1 + d2 >= K && before[d1] + childRow[d2] === after[want]) pick = [d1, d2]
      }
      const raw = dp[child][flips]
      let from = -1
      for (let x = 0; x <= K && from < 0; x++) if (Math.min(x + 1, K) === pick[1] && raw[x] === childRow[pick[1]]) from = x
      decide(child, flips, from)
      want = pick[0]
    }
  }
  decide(0, 0, dp[0][0].indexOf(result))
  inverted.sort((a, b) => a - b)

  const finalValues = Array(n).fill(0)
  const paint = (v, sign) => {
    const here = inverted.includes(v) ? -sign : sign
    finalValues[v] = here * nums[v]
    kids[v].forEach(c => paint(c, here))
  }
  paint(0, 1)

  frames.push({ ...base, phase: 'done', activeLine: L('answer is the best'), pythonLine: P('return max(dp[0][0])'), v: 0, flips: 0, subtree: order, solved: [...solved], table: dp[0].map(shown), inverted, finalValues, message: `Return ${result}. ${inverted.length ? `Invert ${inverted.join(', ')}` : 'Invert nothing'}: ${finalValues.join(' + ').replaceAll('+ -', '- ')} = ${result}.` })
  return { input: { edges, nums, k }, result, frames, tree, K }
}
