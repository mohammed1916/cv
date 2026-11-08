import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1556',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Whole number (no leading zeros)',
  url: 'https://leetcode.com/problems/thousand-separator/',
  complexity: 'O(d) time and O(d) space, where d is the number of digits.',
  examples: [
    { label: 'Four digits', input: '1000' },
    { label: 'Nine digits', input: '123456789' },
    { label: 'Zero', input: '0' },
    { label: 'Smallest positive', input: '1' },
    { label: 'Two digits', input: '10' },
    { label: 'Largest value', input: '2147483647' },
    { label: 'Long run: 10 digits', input: '1075109676' },
  ],
}

export default function ThousandSeparator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { digits, out, count } = step.snapshot
    return <>
      <div aria-label="Digits" style={{ display: 'flex', gap: 4, fontFamily: 'monospace' }}>
        {digits.split('').map((d, i) => <div key={i} style={{ width: 28, textAlign: 'center', border: '1px solid var(--border)', padding: 4, background: step.snapshot.index === i ? 'var(--surface2)' : 'transparent' }}>{d}</div>)}
      </div>
      <p>Built so far (from the right): <code aria-label="Output">{out || ' '}</code></p>
      <p>Digits read: <strong>{count}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> the dots depend on positions counted from the right, so building the string from the right keeps the groups aligned with no special cases.</p>
    <p>A dot is added only when more digits remain to the left, so the output never starts or ends with a dot.</p>
  </>} />
}
