// LeetCode 1912: each movie keeps its unrented copies in price order; rented copies live in one global order.
// The class keeps both sorted lists updated so search and report only read the front of each list.
const byPriceShop = (a, b) => a[0] - b[0] || a[1] - b[1]
const byPriceShopMovie = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

function insertSorted(list, item, compare) {
  let lo = 0, hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (compare(list[mid], item) < 0) lo = mid + 1
    else hi = mid
  }
  list.splice(lo, 0, item)
}

function removeSorted(list, item, compare) {
  let lo = 0, hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (compare(list[mid], item) < 0) lo = mid + 1
    else hi = mid
  }
  if (lo < list.length && compare(list[lo], item) === 0) list.splice(lo, 1)
}

export class MovieRentingSystem {
  constructor(n, entries) {
    this.price = new Map()
    this.unrented = new Map()
    this.rented = []
    for (const [shop, movie, p] of entries) {
      this.price.set(`${shop},${movie}`, p)
      if (!this.unrented.has(movie)) this.unrented.set(movie, [])
      insertSorted(this.unrented.get(movie), [p, shop], byPriceShop)
    }
  }

  search(movie) {
    return (this.unrented.get(movie) || []).slice(0, 5).map(([, shop]) => shop)
  }

  rent(shop, movie) {
    const p = this.price.get(`${shop},${movie}`)
    removeSorted(this.unrented.get(movie), [p, shop], byPriceShop)
    insertSorted(this.rented, [p, shop, movie], byPriceShopMovie)
  }

  drop(shop, movie) {
    const p = this.price.get(`${shop},${movie}`)
    removeSorted(this.rented, [p, shop, movie], byPriceShopMovie)
    insertSorted(this.unrented.get(movie), [p, shop], byPriceShop)
  }

  report() {
    return this.rented.slice(0, 5).map(([, shop, movie]) => [shop, movie])
  }
}

// The class above is the algorithm. The trace below replays the operations on it and records the state after each one.
const SOURCE = [
  'class MovieRentingSystem {',
  '  constructor(n, entries) {',
  '    for (const [shop, movie, p] of entries) insertSorted(unrented.get(movie), [p, shop])',
  '  }',
  '  search(movie) {',
  '    return unrented.get(movie).slice(0, 5).map(([, shop]) => shop)',
  '  }',
  '  rent(shop, movie) {',
  '    removeSorted(unrented.get(movie), [p, shop]); insertSorted(rented, [p, shop, movie])',
  '  }',
  '  drop(shop, movie) {',
  '    removeSorted(rented, [p, shop, movie]); insertSorted(unrented.get(movie), [p, shop])',
  '  }',
  '  report() {',
  '    return rented.slice(0, 5).map(([, shop, movie]) => [shop, movie])',
  '  }',
  '}',
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `from bisect import bisect_left, insort

class MovieRentingSystem:
    def __init__(self, n, entries):
        self.price = {}
        self.unrented = {}
        self.rented = []
        for shop, movie, p in entries:
            self.price[(shop, movie)] = p
            self.unrented.setdefault(movie, [])
            insort(self.unrented[movie], (p, shop))

    def search(self, movie):
        return [shop for _, shop in self.unrented.get(movie, [])[:5]]

    def rent(self, shop, movie):
        p = self.price[(shop, movie)]
        lst = self.unrented[movie]
        del lst[bisect_left(lst, (p, shop))]
        insort(self.rented, (p, shop, movie))

    def drop(self, shop, movie):
        p = self.price[(shop, movie)]
        del self.rented[bisect_left(self.rented, (p, shop, movie))]
        insort(self.unrented.setdefault(movie, []), (p, shop))

    def report(self):
        return [[shop, movie] for _, shop, movie in self.rented[:5]]
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'search', label: 'Search', description: 'Cheapest unrented copies for a movie, up to five shops.' },
  { id: 'rent', label: 'Rent', description: 'Move a copy from unrented into the rented list.' },
  { id: 'drop', label: 'Drop', description: 'Return a copy to the unrented list.' },
  { id: 'report', label: 'Report', description: 'Cheapest rented copies overall, up to five.' },
  { id: 'done', label: 'Result', description: 'All operations are processed.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON with entries ([shop, movie, price]) and ops (search, rent, drop, report).') }
  if (!Array.isArray(input?.entries) || input.entries.length > 12 || !input.entries.every(e => Array.isArray(e) && e.length === 3 && e.every(Number.isInteger))) throw new Error('entries is at most 12 [shop, movie, price] triples.')
  if (!Array.isArray(input.ops) || input.ops.length > 20) throw new Error('ops is at most 20 operations.')
  const pairs = new Set()
  for (const [s, m] of input.entries) {
    if (pairs.has(`${s},${m}`)) throw new Error('Each shop carries a movie at most once.')
    pairs.add(`${s},${m}`)
  }
  input.ops.forEach(op => {
    if (!Array.isArray(op) || !['search', 'rent', 'drop', 'report'].includes(op[0])) throw new Error('Operations are search, rent, drop or report.')
  })
  return { entries: input.entries, ops: input.ops }
}

function snapshot(system) {
  return {
    unrented: [...system.unrented.entries()].map(([movie, copies]) => ({ movie, shops: copies.map(([p, shop]) => ({ shop, price: p })) })),
    rented: system.rented.map(([p, shop, movie]) => ({ shop, movie, price: p })),
  }
}

export function buildTrace({ entries, ops }) {
  const system = new MovieRentingSystem(0, entries)
  const frames = []
  const results = []
  ops.forEach((op, index) => {
    const [name, a, b] = op
    let result = null
    if (name === 'search') result = system.search(a)
    else if (name === 'rent') system.rent(a, b)
    else if (name === 'drop') system.drop(a, b)
    else result = system.report()
    results.push(result)
    frames.push({
      phase: name,
      activeLine: L(name === 'search' ? 'return unrented.get' : name === 'report' ? 'return rented.slice' : name === 'rent' ? 'removeSorted(unrented' : 'removeSorted(rented'),
      pythonLine: P(name === 'search' ? 'def search' : name === 'report' ? 'def report' : name === 'rent' ? 'def rent' : 'def drop'),
      message: `Operation ${index + 1}: ${op.join(' ')}`,
      op: index, args: op, state: snapshot(system), result,
    })
  })
  frames.push({ phase: 'done', activeLine: L('class MovieRentingSystem'), pythonLine: P('class MovieRentingSystem'), message: 'All operations processed.', op: -1, args: null, state: snapshot(system), result: null })
  return { input: { entries, ops }, result: results, frames }
}
