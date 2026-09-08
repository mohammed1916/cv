import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'
const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'Timer in seconds (JSON integer)',
  url: 'https://leetcode.com/problems/traffic-signal-color/',
  complexity: 'O(1) time and space: at most three condition checks.',
  phases: [
    { id: 'start', label: 'Input', description: 'Read the timer without changing it.' },
    { id: 'green', label: 'Zero?', description: 'Only timer 0 is Green.' },
    { id: 'orange', label: 'Exactly 30?', description: 'Only timer 30 is Orange.' },
    { id: 'red', label: '(30, 90]?', description: 'Red excludes 30 and includes 90.' },
    { id: 'done', label: 'Return', description: 'Return the matched color or Invalid.' },
  ],
  examples: [
    { label: 'Red: 60', input: '60' }, { label: 'Invalid: 5', input: '5' },
    { label: 'Green: 0', input: '0' }, { label: 'Orange: 30', input: '30' },
    { label: 'Red boundary: 90', input: '90' }, { label: 'Beyond red: 91', input: '91' },
  ],
}
export default function TrafficSignal() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Timer (unchanged during evaluation)" length={1} valueAt={() => run.input} />
    <svg width={220} height={260} role="img" aria-label={`Traffic signal: ${step.result || 'not decided'}`}>
      <rect x={15} y={10} width={90} height={235} rx={15} fill="var(--surface2)" stroke="currentColor" />
      {['Red', 'Orange', 'Green'].map((name, i) => <g key={name} data-light={name} data-active={step.result === name}>
        <circle cx={60} cy={52 + 76 * i} r={26} fill={step.result === name ? { Red: '#dc2626', Orange: '#f97316', Green: '#16a34a' }[name] : 'var(--surface)'} stroke="currentColor" />
        <text x={115} y={57 + 76 * i} fill="currentColor" fontSize={12}>{name}{step.result === name ? ' — ON' : ''}</text>
      </g>)}
    </svg>
    <table><caption>Exact rule evaluation</caption><thead><tr><th>Condition</th><th>Result</th></tr></thead><tbody>
      {['timer = 0', 'timer = 30', '30 < timer ≤ 90'].map((rule, i) => <tr key={rule}><th>{rule}</th><td>{i < step.checked ? String(run.checks[i]) : step.phase === 'done' ? 'Skipped' : 'Not checked'}</td></tr>)}
    </tbody></table>
    {step.phase === 'done' && <output aria-label="Traffic signal result">Signal: {run.result}</output>}
  </>} renderReasoning={() => <>
    <p>These are the problem's exact rules, not a continuous countdown cycle. Timers 1–29 and 91–1000 return Invalid.</p>
    <p>“Invalid” is a valid answer for an in-range timer; malformed or out-of-range input is a separate validation error.</p>
    <p>The signal names and ON labels convey the result without depending on color perception.</p>
  </>} />
}
