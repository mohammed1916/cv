// Restore the array from adjacent pairs: the two values seen once are the ends; walk from one end to the other.
const JS_LINES = [
  { text: 'const adj = new Map()', py: 'adj = {}' },
  { text: 'for (const [a, b] of adjacentPairs) { add(adj, a, b); add(adj, b, a) }', py: 'for a, b in adjacent_pairs' },
  { text: 'let cur = [...adj.keys()].find(v => adj.get(v).length === 1)', py: 'cur = next(' },
  { text: 'const out = [cur]; let prev = null', py: 'out = [cur]' },
  { text: 'while (out.length < adjacentPairs.length + 1) {', py: 'while len(out)' },
  { text: 'const next = adj.get(cur).find(v => v !== prev)', py: 'nxt = [v for v in adj[cur] if v != prev][0]' },
  { text: 'prev = cur; cur = next; out.push(cur)', py: 'prev, cur = cur, nxt' },
  { text: '}', py: null },
  { text: 'return out', py: 'return out' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def restoreArray(adjacent_pairs):
    adj = {}
    for a, b in adjacent_pairs:
        adj.setdefault(a, []).append(b)
        adj.setdefault(b, []).append(a)
    cur = next(v for v in adj if len(adj[v]) == 1)
    out = [cur]
    prev = None
    while len(out) < len(adjacent_pairs) + 1:
        nxt = [v for v in adj[cur] if v != prev][0]
        prev, cur = cur, nxt
        out.append(cur)
    return out
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return out')]))

export const phases = [
  { id: 'graph', label: 'Neighbours', description: 'Each value lists its neighbours from the pairs.' },
  { id: 'start', label: 'Start', description: 'A value with only one neighbour is an end of the array.' },
  { id: 'walk', label: 'Walk', description: 'From the current value, move to the neighbour that is not the one just left.' },
  { id: 'done', label: 'Result', description: 'The walk covers every value once.' },
]

export const examples = [
  { label: 'Chain of five', input: '[[7,3],[3,9],[9,4],[4,1]]' },
  { label: 'Two values', input: '[[5,-2]]' },
]

export const complexity = 'O(n) time and O(n) space for n values.'

export function parseInput(text) {
  const pairs = JSON.parse(text)
  if (!Array.isArray(pairs) || pairs.length < 1 || pairs.length > 12) throw new Error('Use a JSON array of 1 to 12 pairs (visual cap).')
  for (const [a, b] of pairs) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a === b || Math.abs(a) > 100 || Math.abs(b) > 100) throw new Error('Each pair is two different integers from -100 to 100.')
  }
  const values = pairs.flat()
  if (new Set(values).size !== values.length - (pairs.length - 1) * 2 + 0 && new Set(values).size !== pairs.length + 1) throw new Error('Pairs describe a single chain of distinct values.')
  return pairs
}

export function buildTrace(pairs) {
  const frames = []
  const adj = new Map()
  const add = (a, b) => { if (!adj.has(a)) adj.set(a, []); adj.get(a).push(b) }
  for (const [a, b] of pairs) { add(a, b); add(b, a) }
  const snap = extra => ({ out: [], ...extra })
  frames.push({ phase: 'graph', activeLine: 2, out: [], message: `Neighbours recorded for ${adj.size} values.`, snapshot: snap({}) })
  const start = [...adj.keys()].find(v => adj.get(v).length === 1)
  let cur = start
  let prev = null
  const out = [cur]
  frames.push({ phase: 'start', activeLine: 3, out: [...out], message: `Start at ${cur}, which has one neighbour.`, snapshot: snap({ out: [...out] }) })
  while (out.length < pairs.length + 1) {
    const next = adj.get(cur).find(v => v !== prev)
    prev = cur
    cur = next
    out.push(cur)
    frames.push({ phase: 'walk', activeLine: 6, out: [...out], message: `Move to ${cur}.`, snapshot: snap({ out: [...out] }) })
  }
  frames.push({ phase: 'done', activeLine: 9, out: [...out], result: out, message: `Restored: [${out.join(', ')}].`, snapshot: snap({ out: [...out], result: out }) })
  return { input: pairs, result: out, frames }
}
