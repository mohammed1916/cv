import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Read the range and the divisor.' },
    { id: 'count', label: 'Count', description: 'Count beautiful integers up to one bound with a digit DP.' },
    { id: 'done', label: 'Combine', description: 'Subtract the count below low from the count up to high.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with low, high and k, for example {"low":10,"high":20,"k":3}',
  url: 'https://leetcode.com/problems/number-of-beautiful-integers-in-the-range/',
  complexity: 'O(d * d * k * 10) states per bound for d digits, memoized. The visualization caps high at 10000 and k at 20.',
  examples: [
    { label: 'Example 1', input: '{"low":10,"high":20,"k":3}' },
    { label: 'Divisor 1', input: '{"low":1,"high":10,"k":1}' },
    { label: "Single number", input: "{\"low\":7,\"high\":7,\"k\":1}" },
    { label: "Full range, many divisors", input: "{\"low\":1,\"high\":10000,\"k\":20}" },
    { label: "Equal bounds", input: "{\"low\":12,\"high\":12,\"k\":4}" },
    { label: "Long run: seeded range", input: "{\"low\":3065,\"high\":3906,\"k\":7}" },
  ],
}

const cell = { padding: '4px 8px', borderBottom: '1px solid var(--surface2)', color: 'var(--text)' }

function StateTable({ states }) {
  if (!states.length) return <p style={{ color: 'var(--text)' }}>No states yet.</p>
  return <div style={{ overflowX: 'auto', maxHeight: 280 }}>
    <table aria-label="Memoized states" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead><tr>{['position', 'even minus odd', 'remainder mod k', 'still tight', 'started', 'ways'].map(h => <th key={h} scope="col" style={{ ...cell, textAlign: 'left', borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}</tr></thead>
      <tbody>{states.map((s, i) => <tr key={i}>
        <td style={cell}>{s.pos}</td><td style={cell}>{s.diff}</td><td style={cell}>{s.rem}</td><td style={cell}>{String(s.tight)}</td><td style={cell}>{String(s.started)}</td><td style={cell}><strong>{s.ways}</strong></td>
      </tr>)}</tbody>
    </table>
  </div>
}

export default function BeautifulIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Range" style={{ color: 'var(--text)' }}>{`Range: ${run.input.low} to ${run.input.high}, divisible by ${run.input.k}`}</output>
    {step.states && <>
      <p style={{ color: 'var(--text)', margin: 0 }}>{`Counting from 1 up to ${step.digits}. A digit adds 1 to the difference when it is even and subtracts 1 when it is odd; the goal is difference 0 and remainder 0.`}</p>
      <StateTable states={step.states} />
    </>}
    <output aria-label="Running count" style={{ color: 'var(--text)' }}>{`Count so far: ${step.total}${step.bound !== '' ? ` (up to ${step.bound})` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A beautiful integer has as many even digits as odd digits and is divisible by k. Tracking the even-minus-odd difference and the remainder mod k as the digits are read captures both conditions.</p>
    <p>Each bound is counted once with memoised states, and the range is the difference of the two bounds.</p>
  </>} />
}
