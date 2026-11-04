export const phases = [
  { id: 'setup', label: 'Separate cities', description: 'Every city starts in its own group.' },
  { id: 'link', label: 'Link multiples', description: 'For each divisor above the threshold, join it with each of its multiples.' },
  { id: 'query', label: 'Check pairs', description: 'Two cities are connected exactly when their groups have the same root.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Number.isInteger(data.n) || !Number.isInteger(data.threshold) || !Array.isArray(data.queries)) throw new Error('Use {"n":..,"threshold":..,"queries":[[a,b],...]}.')
  if (data.n < 1 || data.n > 30) throw new Error('n must be from 1 to 30.')
  if (data.threshold < 0 || data.threshold > data.n) throw new Error('threshold must be from 0 to n.')
  if (data.queries.length < 1 || data.queries.length > 10) throw new Error('Use 1 to 10 queries.')
  for (const q of data.queries) {
    if (!Array.isArray(q) || q.length !== 2 || !q.every(v => Number.isInteger(v) && v >= 1 && v <= data.n)) throw new Error('Each query must be a pair of cities from 1 to n.')
  }
  return { n: data.n, threshold: data.threshold, queries: data.queries.map(q => [...q]) }
}

const CODE = [
  'function areConnected(n, threshold, queries) {',
  '  const parent = Array.from({ length: n + 1 }, (_, c) => c)',
  '  const find = x => { while (parent[x] !== x) x = parent[x]; return x }',
  '  for (let d = threshold + 1; d <= n; d++) {',
  '    for (let m = 2 * d; m <= n; m += d) {',
  '      parent[find(m)] = find(d)',
  '    }',
  '  }',
  '  return queries.map(([a, b]) => find(a) === find(b))',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = { setup: 2, outer: 4, inner: 5, join: 6, query: 9, answer: 9 }
export const python = `def are_connected(n, threshold, queries):
    parent = list(range(n + 1))
    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    for d in range(threshold + 1, n + 1):
        for m in range(2 * d, n + 1, d):
            parent[find(m)] = find(d)
    return [find(a) == find(b) for a, b in queries]`
const PY = python.split('\n')
const P = s => PY.findIndex(t => t.includes(s)) + 1
const PYLINE = { setup: P('parent = list'), outer: P('for d in range'), inner: P('for m in range'), join: P('parent[find(m)]'), query: P('return [find'), answer: P('return [find') }

export function buildTrace(input) {
  const { n, threshold, queries } = input
  const parent = Array.from({ length: n + 1 }, (_, c) => c)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const roots = () => Array.from({ length: n + 1 }, (_, c) => find(c))
  const frames = []
  const frame = (phase, line, message, extra = {}) => frames.push({ phase, activeLine: line, pythonLine: extra.py, message, roots: roots(), pair: extra.pair ?? null, query: extra.query ?? null, answers: extra.answers ?? [] })
  frame('setup', L.setup, `Start with ${n} cities, each in its own group. Only divisors above ${threshold} may link cities.`, { py: PYLINE.setup })
  const answers = []
  for (let d = threshold + 1; d <= n; d++) {
    frame('link', L.outer, `Divisor ${d} is above the threshold, so its multiples ${2 * d <= n ? 'will be joined to it' : 'have none within n'}.`, { py: PYLINE.outer })
    for (let m = 2 * d; m <= n; m += d) {
      const a = find(m), b = find(d)
      if (a !== b) parent[a] = b
      frame('link', L.join, `Join city ${m} to divisor ${d}. ${a !== b ? `Their groups merge under root ${b}.` : 'They already share a group.'}`, { py: PYLINE.join, pair: [d, m] })
    }
  }
  queries.forEach(([a, b], index) => {
    const same = find(a) === find(b)
    answers.push(same)
    frame('query', L.query, `Query ${index + 1}: city ${a} has root ${find(a)} and city ${b} has root ${find(b)}, so they are ${same ? 'connected' : 'not connected'}.`, { py: PYLINE.query, pair: [a, b], query: index, answers: [...answers] })
  })
  frame('query', L.answer, `All ${queries.length} queries are answered: ${answers.map(v => (v ? 'yes' : 'no')).join(', ')}.`, { py: PYLINE.answer, answers: [...answers] })
  return { input, result: answers, frames }
}
