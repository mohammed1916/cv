import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Products table with one column per store'
const complexity = 'O(rows times stores) for the unpivot. The visualizer accepts up to 30 rows per table.'
const examples = [{
  label: 'Sample',
  input: '{"Products":[{"product_id":1,"store1":10,"store2":null,"store3":12},{"product_id":2,"store1":null,"store2":7,"store3":null}]}',
},
    { label: 'All prices missing', input: '{"Products":[{"product_id":4,"store1":null,"store2":null}]}' },
    { label: 'Zero price is kept', input: '{"Products":[{"product_id":1,"store1":0,"store2":5},{"product_id":2,"store1":null,"store2":0}]}' },
    { label: 'Long run: 30 products', input: '{"Products":[{"product_id":1,"store1":39,"store2":32,"store3":15},{"product_id":2,"store1":null,"store2":null,"store3":25},{"product_id":3,"store1":null,"store2":41,"store3":11},{"product_id":4,"store1":39,"store2":47,"store3":12},{"product_id":5,"store1":null,"store2":null,"store3":43},{"product_id":6,"store1":47,"store2":19,"store3":8},{"product_id":7,"store1":12,"store2":null,"store3":null},{"product_id":8,"store1":17,"store2":22,"store3":null},{"product_id":9,"store1":null,"store2":7,"store3":14},{"product_id":10,"store1":null,"store2":48,"store3":null},{"product_id":11,"store1":50,"store2":43,"store3":2},{"product_id":12,"store1":2,"store2":34,"store3":41},{"product_id":13,"store1":5,"store2":15,"store3":29},{"product_id":14,"store1":null,"store2":47,"store3":19},{"product_id":15,"store1":41,"store2":45,"store3":48},{"product_id":16,"store1":null,"store2":14,"store3":41},{"product_id":17,"store1":null,"store2":1,"store3":null},{"product_id":18,"store1":35,"store2":1,"store3":40},{"product_id":19,"store1":12,"store2":50,"store3":21},{"product_id":20,"store1":null,"store2":1,"store3":2},{"product_id":21,"store1":2,"store2":null,"store3":43},{"product_id":22,"store1":46,"store2":48,"store3":6},{"product_id":23,"store1":10,"store2":12,"store3":5},{"product_id":24,"store1":12,"store2":null,"store3":null},{"product_id":25,"store1":39,"store2":42,"store3":44},{"product_id":26,"store1":35,"store2":11,"store3":49},{"product_id":27,"store1":null,"store2":null,"store3":44},{"product_id":28,"store1":1,"store2":5,"store3":0},{"product_id":29,"store1":null,"store2":17,"store3":12},{"product_id":30,"store1":15,"store2":10,"store3":null}]}' }]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

function StageStrip({ phases = [], active }) {
  const at = Math.max(0, phases.findIndex(phase => phase.id === active))
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map((phase, index) => {
      const state = index < at ? 'done' : index === at ? 'active' : 'pending'
      return <li key={phase.id} data-stage={phase.id} data-state={state} title={phase.description} style={{
        padding: '6px 10px', borderRadius: 8, fontSize: 13,
        border: '1px solid var(--border, var(--surface2))',
        background: state === 'active' ? 'var(--primary)' : state === 'done' ? 'var(--surface2)' : 'transparent',
        color: state === 'active' ? 'var(--on-primary, var(--surface))' : 'var(--text)',
        fontWeight: state === 'active' ? 700 : 400,
      }}>{index + 1}. {phase.label}</li>
    })}
  </ol>
}

export default function SqlStageVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each store column is read in turn, NULL prices are skipped, and the rows are sorted by product and store. The store names come from the table columns, not from a fixed list.</p>} />
}
