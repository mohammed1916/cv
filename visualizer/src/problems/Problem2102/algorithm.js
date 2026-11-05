// LeetCode 2102: Sequentially Ordinal Rank Tracker.
// Keep every location in ranking order (higher score first, then smaller name).
// Each add finds its slot by binary search; the i-th get returns the i-th entry.

const MAX_OPS = 40

export function parseInput(text) {
  let ops
  try { ops = JSON.parse(text) } catch { throw new Error('Use a JSON array of operations, e.g. [["add","bob",5],["get"]].') }
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > MAX_OPS) throw new Error(`Use 1 to ${MAX_OPS} operations.`)
  const seen = new Set()
  let added = 0
  let asked = 0
  for (const op of ops) {
    if (op[0] === 'add' && op.length === 3 && typeof op[1] === 'string' && /^[a-z]{1,10}$/.test(op[1]) && Number.isInteger(op[2]) && op[2] >= 1 && op[2] <= 100000 && !seen.has(op[1])) {
      seen.add(op[1])
      added++
    } else if (op.length === 1 && op[0] === 'get') {
      asked++
      if (asked > added) throw new Error('A get needs at least one location added before it.')
    } else {
      throw new Error('Each operation is ["add", name, score] with a unique lowercase name, or ["get"].')
    }
  }
  return { ops }
}

export const code = `function better(a, b) {
  return a.score > b.score || (a.score === b.score && a.name < b.name)
}

class SORTracker {
  constructor() {
    this.items = []
    this.queries = 0
  }

  add(name, score) {
    let lo = 0
    let hi = this.items.length
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (better(this.items[mid], { name, score })) lo = mid + 1
      else hi = mid
    }
    this.items.splice(lo, 0, { name, score })
  }

  get() {
    this.queries++
    return this.items[this.queries - 1].name
  }
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: run_ops
def better(a, b):
    return a[1] > b[1] or (a[1] == b[1] and a[0] < b[0])

def run_ops(ops):
    items = []
    queries = 0
    returned = []
    for op in ops:
        if op[0] == "add":
            name, score = op[1], op[2]
            lo, hi = 0, len(items)
            while lo < hi:
                mid = (lo + hi) // 2
                if better(items[mid], (name, score)):
                    lo = mid + 1
                else:
                    hi = mid
            items.insert(lo, (name, score))
        else:
            queries += 1
            returned.append(items[queries - 1][0])
    return returned
`

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

export const phases = [
  { id: 'start', label: 'Empty ranking', description: 'No locations exist yet.' },
  { id: 'search', label: 'Find slot', description: 'Binary search for where the new location belongs.' },
  { id: 'insert', label: 'Insert', description: 'Place the location at its slot; later ranks shift down.' },
  { id: 'get', label: 'Query', description: 'The i-th query returns the i-th best location.' },
  { id: 'done', label: 'Done', description: 'All operations have run.' },
]

export function buildTrace({ ops }) {
  const frames = []
  let items = []
  let queries = 0
  const returned = []
  const snapshot = () => items.map(item => ({ ...item }))
  frames.push({ phase: 'start', activeLine: L('this.items = []'), pythonLine: P('items = []'), message: 'Start with an empty ranking.', items: [], lo: null, hi: null, mid: null, marks: {}, returned: [], opIndex: -1 })
  ops.forEach((op, opIndex) => {
    if (op[0] === 'add') {
      const [, name, score] = op
      let lo = 0
      let hi = items.length
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2)
        frames.push({ phase: 'search', activeLine: L('const mid'), pythonLine: P('mid = (lo + hi)'), message: `Compare ${name} (${score}) with ${items[mid].name} (${items[mid].score}) at rank ${mid + 1}.`, items: snapshot(), lo, hi, mid, marks: { [mid]: 'mid' }, returned: [...returned], opIndex })
        if (better(items[mid], { name, score })) lo = mid + 1
        else hi = mid
      }
      items = [...items.slice(0, lo), { name, score }, ...items.slice(lo)]
      frames.push({ phase: 'insert', activeLine: L('splice'), pythonLine: P('items.insert'), message: `${name} (${score}) takes rank ${lo + 1}; locations below it move down one rank.`, items: snapshot(), lo: null, hi: null, mid: null, marks: { [lo]: 'new' }, returned: [...returned], opIndex })
    } else {
      queries++
      const answer = items[queries - 1].name
      returned.push(answer)
      frames.push({ phase: 'get', activeLine: L('return this.items'), pythonLine: P('returned.append'), message: `Query ${queries} returns ${answer}, the ${queries}-th best so far.`, items: snapshot(), lo: null, hi: null, mid: null, marks: { [queries - 1]: 'answer' }, returned: [...returned], opIndex })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return this.items'), pythonLine: P('return returned'), message: `Returned ${returned.join(', ')}.`, items: snapshot(), lo: null, hi: null, mid: null, marks: {}, returned: [...returned], opIndex: ops.length - 1 })
  return { input: { ops }, result: returned, frames }
}

function better(a, b) {
  return a.score > b.score || (a.score === b.score && a.name < b.name)
}
