import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Read the two bounds.' },
    { id: 'count', label: 'Count', description: 'Count stepping numbers up to one bound with a digit DP.' },
    { id: 'done', label: 'Combine', description: 'Combine the two counts into the range answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with low and high as digit strings, for example {"low":"1","high":"11"}',
  url: 'https://leetcode.com/problems/count-stepping-numbers-in-range/',
  complexity: 'O(d * 10 * 2) states per bound for d digits, memoized. The visualization caps bounds at 4 digits.',
  examples: [
    { label: 'Example 1', input: '{"low":"1","high":"11"}' },
    { label: 'Two digits', input: '{"low":"90","high":"101"}' },
    { label: 'Single digit', input: '{"low":"5","high":"5"}' },
    { label: 'Equal bounds', input: '{"low":"1000","high":"1000"}' },
    { label: 'Boundary: 1 to 4-digit maximum', input: '{"low":"1","high":"9999"}' },
    { label: 'Long run: 1234 to 9876', input: '{"low":"1234","high":"9876"}' },
  ],
}

const cell = { padding: '4px 8px', borderBottom: '1px solid var(--surface2)', color: 'var(--text)' }

function DigitStrip({ digits, pos }) {
  return <ol aria-label={`Digits of ${digits}`} style={{ display: 'flex', gap: 6, padding: 0, listStyle: 'none', margin: 0 }}>
    {[...digits].map((d, i) => <li key={i} data-pos={i === pos} style={{
      minWidth: 34, textAlign: 'center', padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border, currentColor)',
      background: i === pos ? 'var(--primary)' : 'transparent', color: i === pos ? '#fff' : 'var(--text)', fontWeight: i === pos ? 700 : 400,
    }}><small>pos {i}</small><div>{d}</div></li>)}
  </ol>
}

function StateTable({ states }) {
  if (!states.length) return <p style={{ color: 'var(--text)' }}>No states yet.</p>
  return <div style={{ overflowX: 'auto', maxHeight: 260 }}>
    <table aria-label="Memoized states" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead><tr>{['position', 'previous digit', 'still tight', 'started', 'ways'].map(h => <th key={h} scope="col" style={{ ...cell, textAlign: 'left', borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}</tr></thead>
      <tbody>{states.map((s, i) => <tr key={i}>
        <td style={cell}>{s.pos}</td><td style={cell}>{s.prev}</td><td style={cell}>{String(s.tight)}</td><td style={cell}>{String(s.started)}</td><td style={cell}><strong>{s.ways}</strong></td>
      </tr>)}</tbody>
    </table>
  </div>
}

export default function CountSteppingNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Range" style={{ color: 'var(--text)' }}>{`Range: ${run.input.low} to ${run.input.high}`}</output>
    {step.digits !== undefined && <>
      <p style={{ color: 'var(--text)', margin: 0 }}>{`Counting from 1 up to ${step.digits}. Each state is (position, previous digit, still tight, started).`}</p>
      <DigitStrip digits={step.digits} pos={-1} />
      <StateTable states={step.states} />
    </>}
    <output aria-label="Running count" style={{ color: 'var(--text)' }}>{`Count so far: ${step.total}${step.bound ? ` (up to ${step.bound})` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A stepping number changes by exactly one between neighbouring digits, so the only information needed while walking the digits is the previous digit.</p>
    <p>Memoising on (position, previous digit, tight, started) means each state is solved once, and the same counts answer both bounds.</p>
  </>} />
}
