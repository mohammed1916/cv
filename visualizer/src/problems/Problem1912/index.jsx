import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'entries: for each (shop, movie, price) add to unrented',
  'search(movie): take up to 5 unrented copies ordered by price, shop',
  'rent(shop, movie): move that copy from unrented to rented',
  'drop(shop, movie): move that copy from rented back to unrented',
  'report(): take up to 5 rented copies ordered by price, shop, movie',
  'return one result per operation',
].map((text, index) => ({ line: index + 1, text }))

const python = `def run_ops(n, entries, ops):
    price = {}
    unrented, rented, out = {}, set(), []
    for shop, movie, p in entries:
        price[(shop, movie)] = p
        unrented.setdefault(movie, set()).add(shop)
    def key(shop, movie):
        return (price[(shop, movie)], shop, movie)
    for op in ops:
        name = op[0]
        if name == "search":
            copies = sorted(unrented.get(op[1], set()), key=lambda s: (price[(s, op[1])], s))
            out.append([s for s in copies[:5]])
        elif name == "rent":
            shop, movie = op[1], op[2]
            unrented[movie].discard(shop)
            rented.add((shop, movie))
            out.append(None)
        elif name == "drop":
            shop, movie = op[1], op[2]
            rented.discard((shop, movie))
            unrented.setdefault(movie, set()).add(shop)
            out.append(None)
        else:
            items = sorted(rented, key=lambda sm: (price[sm], sm[0], sm[1]))
            out.append([[s, m] for s, m in items[:5]])
    return out
`

const PY = { search: 12, rent: 16, drop: 21, report: 26, done: 27 }

export function parse(text) {
  const input = JSON.parse(text)
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

export function build({ entries, ops }) {
  const price = new Map()
  const unrented = new Map()
  const rented = new Set()
  const frames = []
  for (const [shop, movie, p] of entries) {
    price.set(`${shop},${movie}`, p)
    if (!unrented.has(movie)) unrented.set(movie, new Set())
    unrented.get(movie).add(shop)
  }
  const snapshot = () => ({
    unrented: [...unrented.entries()].map(([movie, shops]) => ({ movie, shops: [...shops].sort((a, b) => price.get(`${a},${movie}`) - price.get(`${b},${movie}`) || a - b) })),
    rented: [...rented].map(k => { const [s, m] = k.split(',').map(Number); return { shop: s, movie: m, price: price.get(k) } })
      .sort((a, b) => a.price - b.price || a.shop - b.shop || a.movie - b.movie),
  })
  const results = []
  ops.forEach((op, index) => {
    const [name, a, b] = op
    let result = null
    let phase = name
    let line = 0, pythonLine = 0
    if (name === 'search') {
      line = 2; pythonLine = PY.search
      const shops = [...(unrented.get(a) || [])].sort((x, y) => price.get(`${x},${a}`) - price.get(`${y},${a}`) || x - y).slice(0, 5)
      result = shops
    } else if (name === 'rent') {
      line = 3; pythonLine = PY.rent
      unrented.get(b)?.delete(a)
      rented.add(`${a},${b}`)
    } else if (name === 'drop') {
      line = 4; pythonLine = PY.drop
      rented.delete(`${a},${b}`)
      if (!unrented.has(b)) unrented.set(b, new Set())
      unrented.get(b).add(a)
    } else {
      line = 5; pythonLine = PY.report
      result = snapshot().rented.slice(0, 5).map(r => [r.shop, r.movie])
    }
    results.push(result)
    frames.push({ phase, activeLine: line, pythonLine, message: `Operation ${index + 1}: ${op.join(' ')}`, op: index, state: snapshot(), result })
  })
  frames.push({ phase: 'done', activeLine: 6, pythonLine: PY.done, message: 'All operations processed.', op: -1, state: snapshot(), result: null })
  return { input: { entries, ops }, result: results, frames }
}

const definition = {
  phases: [
    { id: 'search', label: 'Search', description: 'Cheapest unrented copies for a movie.' },
    { id: 'rent', label: 'Rent', description: 'Move a copy into the rented set.' },
    { id: 'drop', label: 'Drop', description: 'Return a copy to the unrented set.' },
    { id: 'report', label: 'Report', description: 'Cheapest rented copies overall.' },
    { id: 'done', label: 'Result', description: 'All results are ready.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with entries ([shop, movie, price]) and ops (search, rent, drop, report)',
  url: 'https://leetcode.com/problems/design-movie-rental-system/',
  complexity: 'The visualization rebuilds sorted views per operation for clarity; the class form keeps sorted sets updated so each query takes logarithmic time.',
  examples: [
    { label: 'Example', input: '{"entries":[[0,4,8],[0,5,9],[1,4,6],[2,4,2]],"ops":[["search",4],["rent",2,4],["report"],["drop",2,4],["search",4]]}' },
  ],
}

export default function DesignMovieRentalSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Unrented copies">
      <thead><tr><th>Movie</th><th>Shops, cheapest first</th></tr></thead>
      <tbody>{step.state.unrented.map(row => <tr key={row.movie}><td>{row.movie}</td><td>{row.shops.join(', ') || 'none'}</td></tr>)}</tbody>
    </table>
    <table aria-label="Rented copies">
      <thead><tr><th>Shop</th><th>Movie</th><th>Price</th></tr></thead>
      <tbody>{step.state.rented.map(r => <tr key={`${r.shop}-${r.movie}`}><td>{r.shop}</td><td>{r.movie}</td><td>{r.price}</td></tr>)}</tbody>
    </table>
    <output aria-label="Operation result">{step.op >= 0 ? JSON.stringify(step.result) : `${run.result.length} results`}</output>
  </>} renderReasoning={() => <>
    <p>Each movie keeps its unrented shops in price order, so search reads the cheapest few. Rented copies live in one global order that report reads.</p>
    <p>Rent and drop only move one copy between the two collections.</p>
  </>} />
}
