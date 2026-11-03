import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1295',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of positive integers (JSON)',
  url: 'https://leetcode.com/problems/find-numbers-with-even-number-of-digits/',
  complexity: 'O(n * d) time where d is the digit count (at most 6 here), and O(1) extra space.',
  examples: [
    { label: 'Mixed lengths', input: '[12,345,2,6,7896]' },
    { label: 'Four-digit heavy', input: '[555,901,482,1771]' },
    { label: 'Growing lengths', input: '[1,22,333,4444,55555,66666]' },
  ],
}

export default function EvenDigitCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, value, digits, verdict, count, digitCounts } = step.snapshot
    return <>
      <div role="img" aria-label="Numbers and their digit counts" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.map((v, i) => {
          const done = i < digitCounts.length
          const isCurrent = i === index
          return <div key={i} data-index={i} style={{
            minWidth: 64, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? 'var(--text)' : 'var(--border)'}`,
            background: done && digitCounts[i] % 2 === 0 ? '#bbf7d0' : done ? '#e7e5e4' : 'transparent', color: '#1c1917',
          }}><div>{v}</div><small>{done ? `${digitCounts[i]} digits` : '...'}</small></div>
        })}
      </div>
      <p>{index === null ? 'No number is under inspection.' : `Number ${value}: ${digits} digit(s) counted${verdict ? `, ${verdict}` : ''}.`}</p>
      <p>Even-digit count so far: <strong>{count}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Count digits, not magnitude:</strong> the question is about how many digits a number has, so the algorithm counts them by repeated division by ten.</p>
    <p><strong>Parity of the count:</strong> only the final digit count is tested for evenness; the value itself is never compared.</p>
  </>} />
}
