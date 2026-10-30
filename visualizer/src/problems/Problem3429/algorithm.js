export const python = `def minCost(n, cost):
    colors = [0, 1, 2]
    states = [(a, b) for a in colors for b in colors if a != b]
    half = n // 2
    best = {(a, b): cost[0][a] + cost[n - 1][b] for a, b in states}
    for p in range(1, half):
        nxt = {}
        for a, b in states:
            prev = min(best[(pa, pb)] for pa, pb in states if pa != a and pb != b)
            nxt[(a, b)] = prev + cost[p][a] + cost[n - 1 - p][b]
        best = nxt
    return min(best.values())
`

const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const code = [
  'FUNCTION minCost(n, cost)',
  'states ← ordered color pairs (a, b) with a ≠ b',
  'pair 0 ← cost[0][a] + cost[n − 1][b] for each state',
  'FOR p FROM 1 TO n / 2 − 1',
  'FOR EACH state (a, b)',
  'prev ← min over states (pa, pb) with pa ≠ a and pb ≠ b',
  'best[a][b] ← prev + cost[p][a] + cost[n − 1 − p][b]',
  'RETURN the minimum over all states of the last pair',
].map((text, index) => ({ line: index + 1, text }))

export function parseInput(text) {
  const data = typeof text === 'string' ? JSON.parse(text) : text
  if (!data || typeof data !== 'object') throw new Error('Use a JSON object with n and cost.')
  const { n, cost } = data
  if (!Number.isInteger(n) || n < 2 || n > 12 || n % 2 !== 0) throw new Error('n must be an even integer from 2 to 12 for this visualization.')
  if (!Array.isArray(cost) || cost.length !== n) throw new Error('cost must have exactly n rows.')
  cost.forEach((row, index) => {
    if (!Array.isArray(row) || row.length !== 3) throw new Error(`cost[${index}] must have exactly 3 entries.`)
    if (!row.every(value => Number.isInteger(value) && value >= 0 && value <= 20)) throw new Error(`cost[${index}] entries must be integers from 0 to 20 for this visualization.`)
  })
  return { n, cost: cost.map(row => [...row]) }
}

export function buildTrace(input) {
  const { n, cost } = input
  const half = n / 2
  const states = []
  for (const a of [0, 1, 2]) for (const b of [0, 1, 2]) if (a !== b) states.push([a, b])
  const stateLabel = ([a, b]) => `${a + 1},${b + 1}`
  const table = Array.from({ length: half }, () => Array(states.length).fill(null))
  const rowLabels = Array.from({ length: half }, (_, p) => `pair ${p} (houses ${p}, ${n - 1 - p})`)
  const columnLabels = states.map(stateLabel)
  const frames = []
  const snap = extra => ({ table: table.map(row => [...row]), row: -1, column: -1, rowLabels, columnLabels, result: null, ...extra })
  states.forEach(([a, b], c) => {
    table[0][c] = cost[0][a] + cost[n - 1][b]
    frames.push(snap({ phase: 'start', activeLine: 3, pythonLine: P('best = {(a, b)'), row: 0, column: c,
      message: `Outer pair: house 0 gets color ${a + 1} and house ${n - 1} gets color ${b + 1}, cost ${table[0][c]}.` }))
  })
  for (let p = 1; p < half; p++) {
    states.forEach(([a, b], c) => {
      const prev = Math.min(...states.map(([pa, pb], i) => (pa !== a && pb !== b ? table[p - 1][i] : Infinity)))
      table[p][c] = prev + cost[p][a] + cost[n - 1 - p][b]
      frames.push(snap({ phase: 'pairs', activeLine: 7, pythonLine: P('nxt[(a, b)] = prev'), row: p, column: c,
        message: `Pair ${p} colors ${a + 1},${b + 1}: best previous pair ${prev}, plus this pair's costs, gives ${table[p][c]}.` }))
    })
  }
  const last = table[half - 1]
  const result = Math.min(...last)
  frames.push(snap({ phase: 'done', activeLine: 8, pythonLine: P('return min(best.values())'), row: half - 1, column: -1, result,
    message: `Return ${result}, the cheapest finish over the last mirror pair.` }))
  return { input, result, frames }
}
