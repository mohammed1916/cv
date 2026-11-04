import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Weather readings for each city and day'
const complexity = 'O(n log n) to sort the readings in each city. The visualizer accepts up to 30 rows per table.'
const examples = [{
  label: 'Sample',
  input: '{"Weather":[{"city_id":1,"day":"2024-03-02","degree":25},{"city_id":2,"day":"2024-03-02","degree":18},{"city_id":1,"day":"2024-03-01","degree":20},{"city_id":3,"day":"2024-03-05","degree":30},{"city_id":2,"day":"2024-03-01","degree":18},{"city_id":1,"day":"2024-03-03","degree":25},{"city_id":3,"day":"2024-03-02","degree":10}]}',
}]

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
  </>} renderReasoning={() => <p>Readings are ranked inside each city by degree from high to low, then by the earlier day. Row number 1 is the answer for that city.</p>} />
}
