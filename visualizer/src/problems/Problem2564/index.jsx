import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Table', description: 'Start an empty table of substring values.' },
    { id: 'record', label: 'Record substring', description: 'Store a substring if it is the shortest, then leftmost, for its value.' },
    { id: 'target', label: 'Query target', description: 'Compute first xor second for this query.' },
    { id: 'answer', label: 'Answer query', description: 'Look up the stored location, or report none.' },
    { id: 'done', label: 'Complete', description: 'All answers are ready.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary string and queries as JSON: s, queries',
  url: 'https://leetcode.com/problems/substring-xor-queries/',
  complexity: 'O(n * 30) time to record substrings and O(1) per query lookup. The visualization caps s at 40 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"101101","queries":[[0,5],[1,2]]}' },
    { label: 'Example 2', input: '{"s":"0101","queries":[[12,8]]}' },
  ],
}

export default function SubstringXorQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [lo, hi] = step.window ?? [-1, -1]
    return <>
      <IndexedSequence label="Binary string s" length={run.input.s.length} valueAt={i => run.input.s[i]}
        active={lo} roleAt={i => (i >= lo && i <= hi ? 'window' : '')} />
      <output aria-label="Current substring">
        {step.window ? `Window [${lo}, ${hi}] has value ${step.value}` : 'No window selected'}
      </output>
      <table aria-label="Query answers">
        <thead><tr><th>Query</th><th>Target</th><th>Answer</th></tr></thead>
        <tbody>{run.input.queries.map(([first, second], index) => (
          <tr key={index}><td>{index + 1}</td><td>{first ^ second}</td>
            <td>{step.answers[index] ? JSON.stringify(step.answers[index]) : '...'}</td></tr>
        ))}</tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p>Any substring with a value below 2^30 that starts with 1 has at most 30 characters, so each start only needs 30 ends.</p>
    <p>For each value the table keeps the shortest substring, and among equal lengths the leftmost one, which is what each query asks for.</p>
  </>} />
}
