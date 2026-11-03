import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, sql } from './algorithm'
import { meta } from './meta'

const inputLabel = 'Order minutes as a JSON list of integers from 0 to 599'
const complexity = 'O(n + 10) time and O(1) extra space: one pass over the orders and ten counters.'
const examples = [
  { label: 'Mixed', input: '[5,62,64,130]' },
  { label: 'Edges', input: '[0,599,540]' },
  { label: 'Empty', input: '[]' },
]
const reasoning = <>
  <p>Teaching rule: the visualizer groups order minutes into ten fixed 60-minute intervals. Each order is placed by integer division by 60, then its interval counter increases by one.</p>
  <p>The same idea in SQL groups rows by the computed interval and counts them.</p>
  <pre><code>{sql}</code></pre>
</>

const definition = {
  number: meta.number,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel,
  complexity,
  examples,
}

export default function CalculateOrdersWithinEachInterval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ol aria-label="Interval counters" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, padding: 0, listStyle: 'none' }}>
      {step.row.counts.map((count, i) => <li key={i} data-active={i === step.row.interval}
        style={{ border: '1px solid currentColor', borderRadius: 6, padding: 6, textAlign: 'center', fontWeight: i === step.row.interval ? 700 : 400 }}>
        <div>{i * 60}-{i * 60 + 59}</div>
        <strong>{count}</strong>
      </li>)}
    </ol>
    <output aria-label="Interval step">{step.message}</output>
  </>} renderReasoning={() => reasoning} />
}
