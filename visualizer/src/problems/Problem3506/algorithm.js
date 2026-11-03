export const phases = [
  { id: 'start', label: 'Read', description: 'Put each strain time into the pool.' },
  { id: 'merge', label: 'Merge', description: 'Take the two smallest entries and let one cell split for them.' },
  { id: 'push', label: 'Split', description: 'The split finishes when the slower of the two parts does, plus splitTime.' },
  { id: 'done', label: 'Result', description: 'Return the completion time of the last entry.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with splitTime and strains.')
  const { splitTime, strains } = input
  if (!Number.isInteger(splitTime) || splitTime < 1 || splitTime > 9) throw new Error('splitTime is an integer from 1 to 9.')
  if (!Array.isArray(strains) || strains.length < 1 || strains.length > 8) throw new Error('strains lists 1 to 8 elimination times.')
  if (!strains.every(t => Number.isInteger(t) && t >= 1 && t <= 9)) throw new Error('Each elimination time is an integer from 1 to 9.')
  return { splitTime, strains: strains.slice() }
}

export const code = [
  'minimum time to eliminate strains',
  '  pool = elimination times, kept as a min-heap',
  '  while the pool holds more than one value',
  '    a = remove the smallest value',
  '    b = remove the smallest value',
  '    push max(a, b) + splitTime back into the pool',
  '  return the last value in the pool',
].map((text, index) => ({ line: index + 1, text }))

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const byValue = (a, b) => a.value - b.value || a.id - b.id

export function buildTrace({ splitTime, strains }) {
  let nextId = strains.length
  const nodes = strains.map((t, i) => ({ id: i, value: t, children: [], leaf: true }))
  let pool = nodes.map(node => ({ id: node.id, value: node.value })).sort(byValue)
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, pool: pool.map(p => ({ ...p })), nodes: nodes.map(n => ({ ...n, children: n.children.slice() })), splitTime, a: null, b: null, ...extra,
  })
  push('start', L('minimum time'), P('def min_time'), `Read ${strains.length} strain${strains.length === 1 ? '' : 's'} and splitTime ${splitTime}.`)
  while (pool.length > 1) {
    push('merge', L('while the pool'), P('while len(pool)'), `The pool holds ${pool.length} entries; the two smallest will share one split.`)
    const a = pool.shift()
    const b = pool.shift()
    push('merge', L('a = remove'), P('a = heapq'), `Take ${a.value} (node ${a.id}) and ${b.value} (node ${b.id}) from the pool.`, { a, b })
    const node = { id: nextId++, value: Math.max(a.value, b.value) + splitTime, children: [a.id, b.id], leaf: false }
    nodes.push(node)
    pool.push({ id: node.id, value: node.value })
    pool.sort(byValue)
    push('push', L('push max(a, b)'), P('heapq.heappush'), `One cell splits: max(${a.value}, ${b.value}) + ${splitTime} = ${node.value}, which re-enters the pool.`, { a, b, created: node.id })
  }
  const result = pool[0].value
  push('done', L('return the last value'), P('return pool[0]'), `The last entry finishes at time ${result}.`, { result })
  return { input: { splitTime, strains }, result, frames }
}

export const python = `import heapq

def min_time_to_eliminate(split_time, strains):
    pool = list(strains)
    heapq.heapify(pool)
    while len(pool) > 1:
        a = heapq.heappop(pool)
        b = heapq.heappop(pool)
        heapq.heappush(pool, max(a, b) + split_time)
    return pool[0]
`
