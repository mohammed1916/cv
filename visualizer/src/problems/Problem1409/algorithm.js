export const phases = [
  { id: 'start', label: 'Start', description: 'The list begins as 1 through m in ascending order.' },
  { id: 'inspect', label: 'Find position', description: 'Locate the requested value and record its zero-based position before anything moves.' },
  { id: 'update', label: 'Move to front', description: 'Take the value out of its place and put it at the front; the entries before it shift right by one.' },
  { id: 'done', label: 'Complete', description: 'Every recorded position is returned in query order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.m) || input.m < 1 || input.m > 12) throw new Error('Use {"m": 1 to 12, "queries": [...]}.')
  if (!Array.isArray(input.queries) || input.queries.length < 1 || input.queries.length > 12) throw new Error('Give between 1 and 12 queries.')
  if (!input.queries.every(q => Number.isInteger(q) && q >= 1 && q <= input.m)) throw new Error(`Each query must be an integer from 1 to ${input.m}.`)
  return { m: input.m, queries: input.queries }
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ m, queries }) {
  let perm = Array.from({ length: m }, (_, i) => i + 1)
  const result = []
  const frames = [{
    phase: 'start', activeLine: L('perm = [1'), pythonLine: P('perm = list'),
    snapshot: { perm: [...perm], query: null, position: null },
    message: `Start with 1 to ${m} in order. There are ${queries.length} queries to answer in turn.`,
  }]
  queries.forEach((q, qi) => {
    const position = perm.indexOf(q)
    frames.push({
      phase: 'inspect', activeLine: L('p = index of q'), pythonLine: P('p = perm.index'),
      snapshot: { perm: [...perm], query: q, position },
      message: `Query ${qi + 1} asks for ${q}. It sits at zero-based position ${position}, so record ${position}.`,
    })
    result.push(position)
    perm = [q, ...perm.filter(v => v !== q)]
    frames.push({
      phase: 'update', activeLine: L('perm.insert(0, q)'), pythonLine: P('perm.insert(0, q)'),
      snapshot: { perm: [...perm], query: q, position },
      message: `Move ${q} to the front: [${perm.join(', ')}]. Entries before its old place each moved one slot right.`,
    })
  })
  frames.push({
    phase: 'done', activeLine: L('return result'), pythonLine: P('return result'),
    snapshot: { perm: [...perm], query: null, position: null },
    message: `Answers in query order: [${result.join(', ')}].`,
  })
  return { input: { m, queries }, result, frames }
}

export const code = `answer each query by moving it to the front:
  perm = [1, 2, ..., m]
  result = []
  for each query q:
    p = index of q in perm
    result.append(p)
    remove q from perm
    perm.insert(0, q)
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def process_queries(queries, m):
    perm = list(range(1, m + 1))
    result = []
    for q in queries:
        p = perm.index(q)
        result.append(p)
        perm.pop(p)
        perm.insert(0, q)
    return result
`
