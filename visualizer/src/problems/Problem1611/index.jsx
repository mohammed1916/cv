import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with n and a result of zero.' },
    { id: 'fold', label: 'XOR value', description: 'Fold the current value into the result.' },
    { id: 'shift', label: 'Shift', description: 'Move to the next lower bit position.' },
    { id: 'done', label: 'Complete', description: 'Report the accumulated result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n from 0 to 1023, e.g. {"n":3}',
  url: 'https://leetcode.com/problems/minimum-one-bit-operations-to-make-integers-zero/',
  complexity: 'O(log n) time and O(1) space. The visualization caps n at 1023.',
  examples: [
    { label: 'Five', input: '{"n":5}' },
    { label: 'Nine', input: '{"n":9}' },
  ],
}

export default function MinimumOneBitOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const bits = x => x.toString(2).padStart(10, '0').split('')
    const row = (label, value, highlight = -1) => <tr key={label}>
      <th scope="row" style={{ textAlign: 'left', color: 'var(--text)', paddingRight: 12 }}>{label}</th>
      <td style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{bits(value).map((digit, k) => <span key={k} style={{
        display: 'inline-block', width: 18, textAlign: 'center', borderRadius: 3,
        background: k === highlight ? 'color-mix(in srgb, var(--primary) 30%, transparent)' : 'transparent',
        fontWeight: k === highlight ? 700 : 400 }}>{digit}</span>)}</td>
      <td style={{ color: 'var(--text)', paddingLeft: 12 }}>{value}</td>
    </tr>
    const highlight = step.bit >= 0 ? 9 - Math.min(step.bit, 9) : -1
    return <>
      <table aria-label="Bit folding" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th /><th scope="col" style={{ color: 'var(--text-muted)' }}>bits (lowest on the right)</th><th scope="col" style={{ color: 'var(--text-muted)' }}>decimal</th></tr></thead>
        <tbody>
          {row('Current value', step.rest, highlight)}
          {row('Result', step.result)}
        </tbody>
      </table>
      <p style={{ color: 'var(--text)' }}>{step.bit < 0 ? 'No bit position is active yet.' : `Bit position ${step.bit} (the highlighted column) is where the current value is read.`}</p>
    </>
  }} renderReasoning={() => <>
    <p>The answer is the XOR of n and all of its right shifts. Each operation changes one bit in a fixed order, so the minimum count is the inverse Gray code of n.</p>
    <p>The loop folds each shifted value into the result, which reproduces that XOR bit by bit from the top.</p>
  </>} />
}
