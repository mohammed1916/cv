import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageBoard from './SqlStageBoard'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Listings table (listing_id, city, price)'
const complexity = 'Two passes over the listing rows: O(n) time plus one entry per city. The visualizer caps the table at 20 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Listings":[{"listing_id":1,"city":"Ashford","price":100},{"listing_id":2,"city":"Ashford","price":300},{"listing_id":3,"city":"Brookvale","price":150},{"listing_id":4,"city":"Brookvale","price":160},{"listing_id":5,"city":"Cedar","price":500},{"listing_id":6,"city":"Cedar","price":100},{"listing_id":7,"city":"Cedar","price":600},{"listing_id":8,"city":"Dunmore","price":260}]}',
},
  { label: "Single listing", input: '{"Listings":[{"listing_id":1,"city":"Vale","price":250}]}' },
  { label: "Equal prices in two cities", input: '{"Listings":[{"listing_id":1,"city":"Vale","price":200},{"listing_id":2,"city":"Cedar","price":200}]}' },
  { label: "Large prices", input: '{"Listings":[{"listing_id":1,"city":"Harbor","price":1000000},{"listing_id":2,"city":"Harbor","price":1}]}' },
  { label: "Long run: 20 listings", input: '{"Listings":[{"listing_id":1,"city":"Dunmore","price":261},{"listing_id":2,"city":"Vale","price":812},{"listing_id":3,"city":"Dunmore","price":579},{"listing_id":4,"city":"Harbor","price":938},{"listing_id":5,"city":"Dunmore","price":621},{"listing_id":6,"city":"Harbor","price":327},{"listing_id":7,"city":"Cedar","price":698},{"listing_id":8,"city":"Pine Hill","price":737},{"listing_id":9,"city":"Dunmore","price":742},{"listing_id":10,"city":"Pine Hill","price":388},{"listing_id":11,"city":"Dunmore","price":172},{"listing_id":12,"city":"Dunmore","price":493},{"listing_id":13,"city":"Harbor","price":525},{"listing_id":14,"city":"Harbor","price":423},{"listing_id":15,"city":"Dunmore","price":642},{"listing_id":16,"city":"Vale","price":404},{"listing_id":17,"city":"Pine Hill","price":634},{"listing_id":18,"city":"Vale","price":489},{"listing_id":19,"city":"Harbor","price":235},{"listing_id":20,"city":"Cedar","price":851}]}' },
]

const stagesOf = run => run.frames.map(f => ({
  id: f.phase, clause: code[f.activeLine - 1]?.text.trim() ?? '', label: phases.find(p => p.id === f.phase)?.label ?? f.phase,
  columns: f.columns, rows: f.rows,
}))

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

export default function ExpensiveCitiesVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStageBoard title="Query stages" stages={stagesOf(run)} active={run.frames.indexOf(step)} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>The overall figure is a row-weighted average: every listing counts once, so a city with many listings pulls it harder.</p>
    <p>Comparing each city average with that single number is the HAVING filter. A city equal to the overall average is not included.</p>
  </>} />
}
