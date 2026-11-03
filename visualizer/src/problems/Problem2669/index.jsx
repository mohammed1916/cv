import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a SpotifyRanking table (id, artist, track, position)'
const complexity = 'O(n) over the ranking records plus a sort of the artists. The visualizer caps the table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"SpotifyRanking":[{"id":1,"artist":"Ada Rowe","track":"Blue Hour","position":1},{"id":2,"artist":"Ben Lo","track":"Night Bus","position":2},{"id":3,"artist":"Ada Rowe","track":"Glass Sky","position":3},{"id":4,"artist":"Cy Vance","track":"Paper Moon","position":4},{"id":5,"artist":"Ben Lo","track":"Night Bus","position":5},{"id":6,"artist":"Ada Rowe","track":"Tin Roof","position":6}]}',
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

export default function CountArtistOccurrences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
