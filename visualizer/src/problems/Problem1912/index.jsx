import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1912',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with entries ([shop, movie, price]) and ops (search, rent, drop, report)',
  url: 'https://leetcode.com/problems/design-movie-rental-system/',
  complexity: 'Each operation touches sorted lists with binary-search insertion and removal, so a search or report reads only the front five entries.',
  examples: [
    { label: 'Search, rent, report', input: '{"entries":[[0,4,8],[0,5,9],[1,4,6],[2,4,2]],"ops":[["search",4],["rent",2,4],["report"],["drop",2,4],["search",4]]}' },
    { label: 'Five shops', input: '{"entries":[[0,7,10],[1,7,9],[2,7,8],[3,7,7],[4,7,6],[5,7,5]],"ops":[["search",7],["rent",5,7],["search",7]]}' },
  { label: 'Single entry', input: "{\"entries\":[[1,2,5]],\"ops\":[[\"search\",2]]}" },
  { label: 'Equal prices at two shops', input: "{\"entries\":[[0,3,6],[1,3,6]],\"ops\":[[\"search\",3],[\"rent\",0,3],[\"search\",3]]}" },
  { label: 'Report with no rentals', input: "{\"entries\":[[4,4,9]],\"ops\":[[\"report\"]]}" },
  { label: 'Long run: 12 entries, 20 operations', input: "{\"entries\":[[3,0,20],[1,3,17],[4,1,1],[1,4,45],[4,4,13],[2,3,2],[1,0,13],[0,1,2],[1,1,49],[0,3,39],[4,2,7],[0,4,6]],\"ops\":[[\"search\",3],[\"drop\",1,0],[\"rent\",0,1],[\"drop\",1,4],[\"report\"],[\"report\"],[\"search\",2],[\"search\",4],[\"rent\",0,4],[\"search\",2],[\"search\",2],[\"search\",0],[\"drop\",1,4],[\"search\",1],[\"report\"],[\"report\"],[\"search\",2],[\"drop\",3,1],[\"search\",0],[\"rent\",1,2]]}" },
  ],
}

function ChipRow({ label, items, highlight }) {
  return <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
    <strong style={{ minWidth: 120 }}>{label}</strong>
    {items.length === 0 && <em>none</em>}
    {items.map((item, i) => <span key={i} style={{
      padding: '4px 8px', borderRadius: 6, fontFamily: 'monospace',
      border: highlight(i) ? '2px solid var(--primary)' : '1px solid var(--border)',
      background: i < 5 ? 'color-mix(in srgb, var(--primary) 10%, var(--surface2))' : 'var(--surface2)',
    }}>{item}</span>)}
  </div>
}

export default function Problem1912Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => {
      const movies = step.state.unrented
      return <>
        <section aria-label="Unrented copies by movie">
          <h3 style={{ fontSize: '.95rem' }}>Unrented copies, cheapest first (shaded = what search returns)</h3>
          {movies.length === 0 && <em>no movies</em>}
          {movies.map(row => <ChipRow key={row.movie} label={`Movie ${row.movie}`}
            items={row.shops.map(c => `shop ${c.shop} · ${c.price}`)}
            highlight={() => false} />)}
        </section>
        <section aria-label="Rented copies">
          <h3 style={{ fontSize: '.95rem' }}>Rented copies, cheapest first (shaded = what report returns)</h3>
          <ChipRow label="Rented" items={step.state.rented.map(r => `shop ${r.shop}, movie ${r.movie} · ${r.price}`)} highlight={() => false} />
        </section>
        <output aria-label="Operation result">{step.op >= 0 && step.result !== null ? `Result: ${JSON.stringify(step.result)}` : step.op >= 0 ? 'Update applied.' : 'All results are ready.'}</output>
      </>
    }}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each movie keeps its unrented shops in price order, so search reads the cheapest few. Rented copies live in one global order that report reads.</p>
    </>}
  />
}
