import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, sampleText } from './algorithm'

const inputLabel = 'Invented sample tables'
const complexity = 'Each table is capped at 12 rows in this visualizer. The trace does one pass per table plus the final output.'
const examples = [{ label: 'Sample', input: sampleText }, { label: "Single bill", input: "{\"Store\":[{\"bill_id\":1,\"customer_id\":7,\"amount\":20}]}" }, { label: "Equal amounts", input: "{\"Store\":[{\"bill_id\":1,\"customer_id\":1,\"amount\":10},{\"bill_id\":2,\"customer_id\":2,\"amount\":10}]}" }, { label: "Largest amounts", input: "{\"Store\":[{\"bill_id\":1,\"customer_id\":1,\"amount\":9999},{\"bill_id\":2,\"customer_id\":1,\"amount\":0}]}" }, { label: "Long run: 12 bills", input: "{\"Store\":[{\"bill_id\":1,\"customer_id\":3,\"amount\":347},{\"bill_id\":2,\"customer_id\":2,\"amount\":423},{\"bill_id\":3,\"customer_id\":1,\"amount\":120},{\"bill_id\":4,\"customer_id\":4,\"amount\":52},{\"bill_id\":5,\"customer_id\":2,\"amount\":367},{\"bill_id\":6,\"customer_id\":1,\"amount\":298},{\"bill_id\":7,\"customer_id\":4,\"amount\":15},{\"bill_id\":8,\"customer_id\":4,\"amount\":12},{\"bill_id\":9,\"customer_id\":3,\"amount\":45},{\"bill_id\":10,\"customer_id\":1,\"amount\":162},{\"bill_id\":11,\"customer_id\":2,\"amount\":33},{\"bill_id\":12,\"customer_id\":1,\"amount\":409}]}" }]

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
