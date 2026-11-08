import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import SqlStageView from './SqlStageView'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = "Object with Keywords and Posts tables"
const complexity = "Roughly O(k + p * w) for k keyword rows, p posts and w words per post. The visualizer caps each table at 12 rows."
const examples = [{
  label: 'Sample',
  input: "{\"Keywords\":[{\"topic_id\":1,\"word\":\"sleep\"},{\"topic_id\":1,\"word\":\"diet\"},{\"topic_id\":2,\"word\":\"run\"},{\"topic_id\":2,\"word\":\"diet\"},{\"topic_id\":3,\"word\":\"flight\"}],\"Posts\":[{\"post_id\":1,\"content\":\"Better sleep and a calm diet\"},{\"post_id\":2,\"content\":\"Morning run, then DIET review\"},{\"post_id\":3,\"content\":\"Booked a flight to Lisbon\"},{\"post_id\":4,\"content\":\"Nothing relevant here\"},{\"post_id\":5,\"content\":\"Diets change; running more\"}]}",
},
  { label: 'Single keyword and post', input: '{"Keywords":[{"topic_id":1,"word":"tea"}],"Posts":[{"post_id":1,"content":"Tea time"}]}' },
  { label: 'Same word under two topics', input: '{"Keywords":[{"topic_id":1,"word":"run"},{"topic_id":2,"word":"run"}],"Posts":[{"post_id":1,"content":"run run"},{"post_id":2,"content":"walking"}]}' },
  { label: 'Long run: twelve keywords and posts', input: '{"Keywords":[{"topic_id":1,"word":"coffee"},{"topic_id":2,"word":"garden"},{"topic_id":3,"word":"recipe"},{"topic_id":4,"word":"budget"},{"topic_id":1,"word":"sleep"},{"topic_id":2,"word":"garden"},{"topic_id":3,"word":"recipe"},{"topic_id":4,"word":"hiking"},{"topic_id":1,"word":"coffee"},{"topic_id":2,"word":"garden"},{"topic_id":3,"word":"travel"},{"topic_id":4,"word":"hiking"}],"Posts":[{"post_id":1,"content":"Sleep tips and a calm diet"},{"post_id":2,"content":"Garden recipe ideas"},{"post_id":3,"content":"Diet change after a flight"},{"post_id":4,"content":"Budget notes for the month"},{"post_id":5,"content":"Coffee roast review"},{"post_id":6,"content":"Morning run with coffee"},{"post_id":7,"content":"Hiking trails near the lake"},{"post_id":8,"content":"Nothing to report today"},{"post_id":9,"content":"Yoga and music before bed"},{"post_id":10,"content":"Music for a quiet run"},{"post_id":11,"content":"Flight deals for travel"},{"post_id":12,"content":"Travel budget spreadsheet"}]}' },
]

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

export default function SqlWalkthrough() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStageView phases={phases} step={step} columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each post is split into lowercase whole words and matched against the keyword index. A post with no matching word is labelled Ambiguous!, and the topics are sorted before joining.</p>} />
}
