import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Listings table (listing_id, city, price)'
const complexity = 'Two passes over the listing rows: O(n) time plus one entry per city. The visualizer caps the table at 20 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Listings":[{"listing_id":1,"city":"Ashford","price":100},{"listing_id":2,"city":"Ashford","price":300},{"listing_id":3,"city":"Brookvale","price":150},{"listing_id":4,"city":"Brookvale","price":160},{"listing_id":5,"city":"Cedar","price":500},{"listing_id":6,"city":"Cedar","price":100},{"listing_id":7,"city":"Cedar","price":600},{"listing_id":8,"city":"Dunmore","price":260}]}',
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

export default function ExpensiveCitiesVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>The overall figure is a row-weighted average: every listing counts once, so a city with many listings pulls it harder.</p>
    <p>Comparing each city average with that single number is the HAVING filter. A city equal to the overall average is not included.</p>
  </>} />
}
