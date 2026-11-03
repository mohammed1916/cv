export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, initial and edges.')
  const { n, initial, edges } = input
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n is an integer from 1 to 8 (runes 0 to n-1).')
  if (!Array.isArray(initial) || !initial.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error('initial lists rune ids from 0 to n-1.')
  if (!Array.isArray(edges) || edges.length > 16) throw new Error('edges holds at most 16 pairs.')
  for (const pair of edges) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 0 && v < n)) {
      throw new Error('Each edge is [from, to] with rune ids from 0 to n-1.')
    }
  }
  return { n, initial, edges }
}

// Runes that reach each other form one component. A component with no arrows coming in from
// other components, and no initial rune, must be started by hand; nothing else needs a start.
export const code = `minimum number of extra starting runes
  reach[a][b] = true when a = b or there is an edge from a to b
  for each middle rune mid, for each a, for each b
    if reach[a][mid] and reach[mid][b] then reach[a][b] = true
  comp[v] = smallest u with reach[u][v] and reach[v][u]
  for each edge a -> b with comp[a] different from comp[b]
    comp[b] has an incoming arrow
  for each initial rune v
    comp[v] has a start
  answer = 0
  for each component representative c
    if c has no incoming arrow and no start then answer = answer + 1
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_runes_to_add(n, initial, edges):
    reach = [[i == j for j in range(n)] for i in range(n)]
    for a, b in edges:
        reach[a][b] = True
    for mid in range(n):
        for a in range(n):
            for b in range(n):
                if reach[a][mid] and reach[mid][b]:
                    reach[a][b] = True
    comp = [min(u for u in range(n) if reach[u][v] and reach[v][u]) for v in range(n)]
    has_in = [False] * n
    for a, b in edges:
        if comp[a] != comp[b]:
            has_in[comp[b]] = True
    has_start = [False] * n
    for v in initial:
        has_start[comp[v]] = True
    answer = 0
    for c in range(n):
        if comp[c] == c and not has_in[c] and not has_start[c]:
            answer += 1
    return answer
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ n, initial, edges }) {
  const frames = []
  const reach = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => a === b))
  for (const [a, b] of edges) reach[a][b] = true
  const comp = Array(n).fill(-1)
  const hasIn = Array(n).fill(false)
  const hasStart = Array(n).fill(false)
  const state = { mid: -1, comp: [...comp], hasIn: [...hasIn], hasStart: [...hasStart], answer: null, edge: null, source: null }
  const copy = () => reach.map(row => [...row])
  const push = (phase, codeText, pyText, message, extra = {}) => {
    frames.push({
      phase, activeLine: L(codeText), pythonLine: P(pyText), message,
      n, initial, edges, reach: copy(), ...state, comp: [...state.comp], hasIn: [...state.hasIn], hasStart: [...state.hasStart], ...extra,
    })
  }

  push('start', 'reach[a][b] = true when a = b', 'reach = [[i == j', `Start from direct arrows: ${edges.length} edge${edges.length === 1 ? '' : 's'}.`)
  for (let mid = 0; mid < n; mid += 1) {
    for (let a = 0; a < n; a += 1) {
      for (let b = 0; b < n; b += 1) {
        if (reach[a][mid] && reach[mid][b]) reach[a][b] = true
      }
    }
    state.mid = mid
    push('closure', 'for each middle rune mid', 'for mid in range(n)', `Rune ${mid} now routes every path that passes through it.`)
  }

  for (let v = 0; v < n; v += 1) {
    let smallest = -1
    for (let u = 0; u < n; u += 1) {
      if (reach[u][v] && reach[v][u]) { smallest = u; break }
    }
    comp[v] = smallest
  }
  state.comp = [...comp]
  push('components', 'comp[v] = smallest u', 'comp = [min(u for u', `Runes that reach each other are grouped; each rune gets a group label.`)

  for (const [a, b] of edges) {
    state.edge = [a, b]
    if (comp[a] !== comp[b]) hasIn[comp[b]] = true
    state.hasIn = [...hasIn]
    push('incoming', 'comp[b] has an incoming arrow', 'has_in[comp[b]] = True', comp[a] !== comp[b] ? `Arrow ${a} to ${b} enters another group.` : `Arrow ${a} to ${b} stays inside its group.`)
  }
  state.edge = null

  for (const v of initial) {
    hasStart[comp[v]] = true
    state.hasStart = [...hasStart]
    push('start-rune', 'comp[v] has a start', 'has_start[comp[v]] = True', `Initial rune ${v} gives its group a start.`)
  }

  let answer = 0
  for (let c = 0; c < n; c += 1) {
    if (comp[c] !== c) continue
    const needsStart = !hasIn[c] && !hasStart[c]
    if (needsStart) answer += 1
    state.source = c
    state.answer = answer
    push('source', 'if c has no incoming arrow and no start', 'if comp[c] == c', needsStart ? `Group ${c} has no arrows in and no start; add one rune from it.` : `Group ${c} is covered; no extra rune needed.`)
  }
  state.source = null
  push('done', 'return answer', 'return answer', `${answer} extra starting rune${answer === 1 ? '' : 's'} needed.`, { answer, result: answer })
  return { input: { n, initial, edges }, result: answer, frames }
}
