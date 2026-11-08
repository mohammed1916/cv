import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Array of wide Products rows'
const complexity = 'Scans the wide rows once per store column, so the work is three passes over the rows. The visualizer caps the input at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '[{"product_id":1,"store1":100,"store2":null,"store3":300},{"product_id":2,"store1":null,"store2":200,"store3":null},{"product_id":3,"store1":150,"store2":160,"store3":170}]',
}, { label: 'All stores empty', input: "[{\"product_id\":9,\"store1\":null,\"store2\":null,\"store3\":null}]" }, { label: 'Equal prices in two stores', input: "[{\"product_id\":1,\"store1\":50,\"store2\":50,\"store3\":null}]" }, { label: 'Twelve rows, large prices', input: "[{\"product_id\":1,\"store1\":999999,\"store2\":null,\"store3\":999999},{\"product_id\":2,\"store1\":999999,\"store2\":999999,\"store3\":999999},{\"product_id\":3,\"store1\":999999,\"store2\":null,\"store3\":999999},{\"product_id\":4,\"store1\":999999,\"store2\":999999,\"store3\":999999},{\"product_id\":5,\"store1\":999999,\"store2\":null,\"store3\":999999},{\"product_id\":6,\"store1\":999999,\"store2\":999999,\"store3\":999999},{\"product_id\":7,\"store1\":999999,\"store2\":null,\"store3\":999999},{\"product_id\":8,\"store1\":999999,\"store2\":999999,\"store3\":999999},{\"product_id\":9,\"store1\":999999,\"store2\":null,\"store3\":999999},{\"product_id\":10,\"store1\":999999,\"store2\":999999,\"store3\":999999},{\"product_id\":11,\"store1\":999999,\"store2\":null,\"store3\":999999},{\"product_id\":12,\"store1\":999999,\"store2\":999999,\"store3\":999999}]" }, { label: 'Long run: 12 rows', input: "[{\"product_id\":1,\"store1\":177,\"store2\":null,\"store3\":395},{\"product_id\":2,\"store1\":184,\"store2\":null,\"store3\":386},{\"product_id\":3,\"store1\":269,\"store2\":null,\"store3\":494},{\"product_id\":4,\"store1\":244,\"store2\":162,\"store3\":null},{\"product_id\":5,\"store1\":null,\"store2\":63,\"store3\":169},{\"product_id\":6,\"store1\":null,\"store2\":294,\"store3\":91},{\"product_id\":7,\"store1\":323,\"store2\":468,\"store3\":491},{\"product_id\":8,\"store1\":85,\"store2\":196,\"store3\":17},{\"product_id\":9,\"store1\":275,\"store2\":null,\"store3\":477},{\"product_id\":10,\"store1\":491,\"store2\":264,\"store3\":444},{\"product_id\":11,\"store1\":211,\"store2\":308,\"store3\":430},{\"product_id\":12,\"store1\":178,\"store2\":343,\"store3\":356}]" }]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }
const STORES = ['store1', 'store2', 'store3']

// The wide table on the left; the store column being unpivoted is highlighted. The long rows built so far are on the right.
export default function UnpivotVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const storeFrames = run.frames.slice(0, run.frames.indexOf(step) + 1).filter(f => f.phase === 'store')
    const activeStore = step.phase === 'store' ? STORES[storeFrames.length - 1] : null
    return <>
      <p style={{ margin: '0 0 8px' }}>{step.message}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
        <table aria-label="Wide products" style={{ borderCollapse: 'collapse' }}>
          <thead><tr>{['product_id', ...STORES].map(c => <th key={c} scope="col" style={{ ...CELL, background: c === activeStore ? 'var(--primary)' : undefined, color: c === activeStore ? 'var(--on-primary, #fff)' : 'var(--text)' }}>{c}</th>)}</tr></thead>
          <tbody>{run.input.map((row, i) => <tr key={i}>
            <td style={CELL}>{row.product_id}</td>
            {STORES.map(s => <td key={s} style={{ ...CELL, background: s === activeStore ? 'var(--surface2)' : undefined, color: row[s] === null ? 'var(--text-muted, var(--text))' : 'var(--text)' }}>{row[s] === null ? 'NULL' : row[s]}</td>)}
          </tr>)}</tbody>
        </table>
        <table aria-label="Long products built so far" style={{ borderCollapse: 'collapse' }}>
          <thead><tr>{['product_id', 'store', 'price'].map(c => <th key={c} scope="col" style={CELL}>{c}</th>)}</tr></thead>
          <tbody>{step.rows.length === 0
            ? <tr><td style={CELL} colSpan={3}>no rows yet</td></tr>
            : step.rows.map((r, i) => <tr key={i}><td style={CELL}>{r.product_id}</td><td style={CELL}>{r.store}</td><td style={CELL}>{r.price}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  }} renderReasoning={() => <p>Each store column is read in turn. A NULL price means the store does not carry the product, so no row is written for it.</p>} />
}
