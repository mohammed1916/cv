import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1346',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer array (JSON)',
  url: 'https://leetcode.com/problems/check-if-n-and-its-double-exist/',
  complexity: 'O(n) expected time and O(n) space: one pass with a set of values already passed.',
  examples: [
    { label: 'Small first', input: '[10,2,5,3]' },
    { label: 'Large first', input: '[7,1,14,11]' },
    { label: 'No partner', input: '[3,1,7,11]' },
  ],
}

export default function DoubleExists() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { values, index, seen, partner, result } = step.snapshot
    return <>
      <div role="img" aria-label="Values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {values.map((value, i) => <div key={i} data-index={i} style={{
          minWidth: 44, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', color: '#1c1917',
          border: `${i === index ? 2 : 1}px solid var(--border)`,
          background: partner !== null && partner !== undefined && (i === index || values[i] === partner) && result !== false ? '#bbf7d0'
            : i === index ? '#bfdbfe' : seen.includes(value) && i < index ? 'var(--surface2)' : 'transparent',
        }}><div>{value}</div><small>{i}</small></div>)}
      </div>
      <p>Remembered so far: {seen.length ? seen.join(', ') : 'nothing yet'}</p>
      {result !== undefined && <p><strong>Answer:</strong> {String(result)}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Look back, then store:</strong> checking before storing means a value is never paired with itself, so one zero alone is not a match.</p>
    <p><strong>Halves:</strong> a value can also be the double of an earlier one, so an even value also checks whether its half was passed.</p>
  </>} />
}
