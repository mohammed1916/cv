import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Weather readings for each city and day'
const complexity = 'O(n log n) to sort the readings in each city. The visualizer accepts up to 30 rows per table.'
const examples = [{
  label: 'Sample',
  input: '{"Weather":[{"city_id":1,"day":"2024-03-02","degree":25},{"city_id":2,"day":"2024-03-02","degree":18},{"city_id":1,"day":"2024-03-01","degree":20},{"city_id":3,"day":"2024-03-05","degree":30},{"city_id":2,"day":"2024-03-01","degree":18},{"city_id":1,"day":"2024-03-03","degree":25},{"city_id":3,"day":"2024-03-02","degree":10}]}',
}, {
  label: 'Single reading',
  input: '{"Weather":[{"city_id":5,"day":"2024-01-01","degree":9}]}',
}, {
  label: 'Equal degrees use the earlier day',
  input: '{"Weather":[{"city_id":1,"day":"2024-05-02","degree":20},{"city_id":1,"day":"2024-05-01","degree":20},{"city_id":1,"day":"2024-05-03","degree":20}]}',
}, {
  label: 'Thirty rows, one city',
  input: '{"Weather":[{"city_id":9,"day":"2024-06-01","degree":15},{"city_id":9,"day":"2024-06-02","degree":15},{"city_id":9,"day":"2024-06-03","degree":15},{"city_id":9,"day":"2024-06-04","degree":15},{"city_id":9,"day":"2024-06-05","degree":15},{"city_id":9,"day":"2024-06-06","degree":15},{"city_id":9,"day":"2024-06-07","degree":15},{"city_id":9,"day":"2024-06-08","degree":15},{"city_id":9,"day":"2024-06-09","degree":15},{"city_id":9,"day":"2024-06-10","degree":15},{"city_id":9,"day":"2024-06-11","degree":15},{"city_id":9,"day":"2024-06-12","degree":15},{"city_id":9,"day":"2024-06-13","degree":15},{"city_id":9,"day":"2024-06-14","degree":15},{"city_id":9,"day":"2024-06-15","degree":15},{"city_id":9,"day":"2024-06-16","degree":15},{"city_id":9,"day":"2024-06-17","degree":15},{"city_id":9,"day":"2024-06-18","degree":15},{"city_id":9,"day":"2024-06-19","degree":15},{"city_id":9,"day":"2024-06-20","degree":15},{"city_id":9,"day":"2024-06-21","degree":15},{"city_id":9,"day":"2024-06-22","degree":15},{"city_id":9,"day":"2024-06-23","degree":15},{"city_id":9,"day":"2024-06-24","degree":15},{"city_id":9,"day":"2024-06-25","degree":15},{"city_id":9,"day":"2024-06-26","degree":15},{"city_id":9,"day":"2024-06-27","degree":15},{"city_id":9,"day":"2024-06-28","degree":15},{"city_id":9,"day":"2024-06-29","degree":15},{"city_id":9,"day":"2024-06-30","degree":15}]}',
}, {
  label: 'Long run: 30 readings',
  input: '{"Weather":[{"city_id":1,"day":"2024-07-05","degree":1},{"city_id":2,"day":"2024-07-17","degree":32},{"city_id":4,"day":"2024-07-18","degree":24},{"city_id":3,"day":"2024-07-21","degree":10},{"city_id":1,"day":"2024-07-11","degree":8},{"city_id":1,"day":"2024-07-03","degree":14},{"city_id":2,"day":"2024-07-19","degree":25},{"city_id":4,"day":"2024-07-09","degree":-1},{"city_id":3,"day":"2024-07-18","degree":32},{"city_id":3,"day":"2024-07-13","degree":20},{"city_id":1,"day":"2024-07-28","degree":14},{"city_id":3,"day":"2024-07-15","degree":34},{"city_id":3,"day":"2024-07-08","degree":40},{"city_id":3,"day":"2024-07-07","degree":24},{"city_id":2,"day":"2024-07-21","degree":19},{"city_id":1,"day":"2024-07-21","degree":5},{"city_id":3,"day":"2024-07-25","degree":-2},{"city_id":4,"day":"2024-07-18","degree":-2},{"city_id":2,"day":"2024-07-01","degree":32},{"city_id":4,"day":"2024-07-28","degree":8},{"city_id":2,"day":"2024-07-19","degree":-4},{"city_id":4,"day":"2024-07-17","degree":13},{"city_id":4,"day":"2024-07-13","degree":-8},{"city_id":2,"day":"2024-07-02","degree":28},{"city_id":3,"day":"2024-07-25","degree":40},{"city_id":4,"day":"2024-07-15","degree":2},{"city_id":1,"day":"2024-07-25","degree":7},{"city_id":2,"day":"2024-07-16","degree":32},{"city_id":4,"day":"2024-07-17","degree":38},{"city_id":2,"day":"2024-07-02","degree":27}]}',
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
