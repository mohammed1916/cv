import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1342',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Nonnegative integer',
  url: 'https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/',
  complexity: 'O(log n) time: each halving removes a binary digit, and each set bit costs at most one subtraction.',
  examples: [
    { label: 'Mixed bits', input: '14' },
    { label: 'Power of two', input: '64' },
    { label: 'Zero', input: '0' },
  ],
}

export default function ReduceToZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { value, steps, path, from } = step.snapshot
    return <>
      <div role="img" aria-label="Value path" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {path.map((v, i) => <span key={i} data-step={i} style={{
          fontFamily: 'monospace', padding: '4px 8px', border: `${i === path.length - 1 ? 2 : 1}px solid var(--border)`,
          background: i === path.length - 1 ? '#bfdbfe' : 'transparent', color: '#1c1917',
        }}>{v}{i < path.length - 1 ? ' →' : ''}</span>)}
      </div>
      <p>Current value <strong>{value}</strong>, steps so far <strong>{steps}</strong>{from !== undefined ? `, last move from ${from}` : ''}.</p>
      <p>Binary of current value: <code>{value.toString(2)}</code></p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Even values halve:</strong> dividing by two drops the lowest binary digit in one step.</p>
    <p><strong>Odd values subtract first:</strong> removing one turns the lowest digit to zero, and then the next step can halve.</p>
    <p>{step.snapshot.result !== undefined ? `Total steps: ${step.snapshot.result}.` : 'Keep applying the rule until the value is zero.'}</p>
  </>} />
}
