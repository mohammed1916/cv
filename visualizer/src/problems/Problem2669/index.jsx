import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a SpotifyRanking table (id, artist, track, position)'
const complexity = 'O(n) over the ranking records plus a sort of the artists. The visualizer caps the table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"SpotifyRanking":[{"id":1,"artist":"Ada Rowe","track":"Blue Hour","position":1},{"id":2,"artist":"Ben Lo","track":"Night Bus","position":2},{"id":3,"artist":"Ada Rowe","track":"Glass Sky","position":3},{"id":4,"artist":"Cy Vance","track":"Paper Moon","position":4},{"id":5,"artist":"Ben Lo","track":"Night Bus","position":5},{"id":6,"artist":"Ada Rowe","track":"Tin Roof","position":6}]}',
}, {
  label: 'Single row',
  input: '{"SpotifyRanking":[{"id":1,"artist":"Mira Kade","track":"Low Tide","position":1}]}',
}, {
  label: 'Equal counts sort by artist name',
  input: '{"SpotifyRanking":[{"id":1,"artist":"Zed Ono","track":"Ember","position":1},{"id":2,"artist":"Amy Ray","track":"Stone","position":2}]}',
}, {
  label: 'Long run: 12 rows, four artists',
  input: '{"SpotifyRanking":[{"id":1,"artist":"Ada Rowe","track":"Track 1","position":1},{"id":2,"artist":"Cy Vance","track":"Track 2","position":2},{"id":3,"artist":"Ben Lo","track":"Track 3","position":3},{"id":4,"artist":"Ada Rowe","track":"Track 4","position":4},{"id":5,"artist":"Dee Park","track":"Track 5","position":5},{"id":6,"artist":"Cy Vance","track":"Track 6","position":6},{"id":7,"artist":"Ada Rowe","track":"Track 7","position":7},{"id":8,"artist":"Ben Lo","track":"Track 8","position":8},{"id":9,"artist":"Dee Park","track":"Track 9","position":9},{"id":10,"artist":"Cy Vance","track":"Track 10","position":10},{"id":11,"artist":"Ada Rowe","track":"Track 11","position":11},{"id":12,"artist":"Ben Lo","track":"Track 12","position":12}]}',
}]
const reasoning = 'Each ranking record adds one to its artist. Sorting the finished counts by occurrences (largest first) and then by artist name gives the output order.'

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

// One chip per SQL stage, in the order the query runs, with the current stage filled.
function StageStrip({ phases = [], current }) {
  const at = Math.max(0, phases.findIndex(p => p.id === current))
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map((p, i) => <li key={p.id} aria-current={p.id === current ? 'step' : undefined} style={{
      padding: '4px 10px', borderRadius: 6, fontSize: 13, color: 'var(--text)',
      border: p.id === current ? '2px solid var(--primary)' : '1px solid var(--border)',
      background: i <= at ? 'var(--primary-glow)' : 'var(--surface)', opacity: i <= at ? 1 : 0.6,
    }}>{p.label}</li>)}
  </ol>
}

export default function CountArtistOccurrences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={definition.phases} current={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
