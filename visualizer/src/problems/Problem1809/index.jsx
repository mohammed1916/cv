import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const examples = [{
  label: 'Sample',
  input: '{"Playback":[{"session_id":1,"customer_id":1,"start_time":10,"end_time":20},{"session_id":2,"customer_id":1,"start_time":30,"end_time":40},{"session_id":3,"customer_id":2,"start_time":5,"end_time":15},{"session_id":4,"customer_id":2,"start_time":50,"end_time":60}],"Ads":[{"ad_id":1,"customer_id":1,"timestamp":25},{"ad_id":2,"customer_id":2,"timestamp":15},{"ad_id":3,"customer_id":1,"timestamp":40},{"ad_id":4,"customer_id":3,"timestamp":55}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Playback and Ads tables',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(P * A) with a nested check, or O((P + A) log A) with sorted ads per customer. The visualizer caps each table at 12 rows.',
  examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function AdFreeSessionsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>A session is kept only when no ad from the same customer has a timestamp between its start and end, inclusive at both ends.</p>
    <p>Each check row shows the window test for one session, so you can see exactly which ad, if any, blocks it.</p>
  </>} />
}
