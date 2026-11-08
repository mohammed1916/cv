import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, sampleText } from './algorithm'

const inputLabel = 'Invented sample tables'
const complexity = 'Each table is capped at 12 rows in this visualizer. The trace does one pass per table plus the final output.'
const examples = [{ label: 'Sample', input: sampleText }, { label: "Single visit", input: "{\"Members\":[{\"member_id\":1,\"name\":\"Ana\"}],\"Visits\":[{\"visit_id\":1,\"member_id\":1}],\"Purchases\":[]}" }, { label: "Equal charges", input: "{\"Members\":[{\"member_id\":1,\"name\":\"Ana\"},{\"member_id\":2,\"name\":\"Ben\"}],\"Visits\":[{\"visit_id\":1,\"member_id\":1},{\"visit_id\":2,\"member_id\":1},{\"visit_id\":3,\"member_id\":2}],\"Purchases\":[{\"visit_id\":1,\"charged_amount\":10},{\"visit_id\":2,\"charged_amount\":10}]}" }, { label: "Zero charge", input: "{\"Members\":[{\"member_id\":3,\"name\":\"Cy\"}],\"Visits\":[{\"visit_id\":5,\"member_id\":3}],\"Purchases\":[{\"visit_id\":5,\"charged_amount\":0}]}" }, { label: "Long run: 12 visits", input: "{\"Members\":[{\"member_id\":1,\"name\":\"M1\"},{\"member_id\":2,\"name\":\"M2\"},{\"member_id\":3,\"name\":\"M3\"},{\"member_id\":4,\"name\":\"M4\"}],\"Visits\":[{\"visit_id\":1,\"member_id\":1},{\"visit_id\":2,\"member_id\":3},{\"visit_id\":3,\"member_id\":4},{\"visit_id\":4,\"member_id\":1},{\"visit_id\":5,\"member_id\":3},{\"visit_id\":6,\"member_id\":2},{\"visit_id\":7,\"member_id\":2},{\"visit_id\":8,\"member_id\":3},{\"visit_id\":9,\"member_id\":4},{\"visit_id\":10,\"member_id\":1},{\"visit_id\":11,\"member_id\":1},{\"visit_id\":12,\"member_id\":3}],\"Purchases\":[{\"visit_id\":1,\"charged_amount\":127},{\"visit_id\":2,\"charged_amount\":178},{\"visit_id\":3,\"charged_amount\":182},{\"visit_id\":4,\"charged_amount\":172},{\"visit_id\":5,\"charged_amount\":146},{\"visit_id\":6,\"charged_amount\":153},{\"visit_id\":7,\"charged_amount\":157},{\"visit_id\":8,\"charged_amount\":190},{\"visit_id\":9,\"charged_amount\":87},{\"visit_id\":10,\"charged_amount\":17},{\"visit_id\":11,\"charged_amount\":65},{\"visit_id\":12,\"charged_amount\":24}]}" }]

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

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each step shows the rows the query holds at that moment, from the first table read through the final output. The sample tables are invented for this walkthrough.</p>} />
}
