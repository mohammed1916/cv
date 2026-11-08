import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1512',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/number-of-good-pairs/',
  complexity: 'O(n) expected time and O(n) space: one pass with a count for each value already seen.',
  examples: [
    { label: 'Sample A', input: '[4,2,4,4,2,9]' },
    { label: 'All equal', input: '[7,7,7,7]' },
    { label: 'No repeats', input: '[1,2,3,4]' },
    { label: 'Single value', input: '[9]' },
    { label: 'Equal pair', input: '[5,5]' },
    { label: 'Value limits', input: '[100,100,1,100]' },
    { label: 'Long run: 60 values', input: '[1,6,3,2,6,9,7,8,6,2,4,4,4,1,10,8,5,6,1,6,3,2,1,4,2,9,1,3,2,6,7,10,4,6,9,2,10,10,8,6,6,6,6,6,5,6,4,1,1,10,10,2,5,7,9,10,6,10,3,4]' },
  ],
}

export default function NumberOfGoodPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, value, seen, good } = step.snapshot
    return <>
      <div role="img" aria-label="Array values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.map((v, i) => <div key={i} style={{
          minWidth: 44, padding: '4px 8px', fontFamily: 'monospace', textAlign: 'center', boxSizing: 'border-box',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i === index ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
        }}><div>{v}</div><small>{i}</small></div>)}
      </div>
      <table aria-label="Counts seen" style={{ fontFamily: 'monospace', borderCollapse: 'collapse', marginTop: 8 }}>
        <thead><tr><th>value</th><th>count so far</th></tr></thead>
        <tbody>{seen.length === 0 ? <tr><td colSpan={2}>empty</td></tr> : seen.map(entry =>
          <tr key={entry.value}><td>{entry.value}{entry.value === value ? ' ←' : ''}</td><td>{entry.count}</td></tr>)}</tbody>
      </table>
      <p>Good pairs so far: <strong>{good}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Count before storing.</strong> Each earlier equal value forms one pair with the current index. Reading the count before incrementing keeps an index from pairing with itself.</p>
    <p><strong>Why a map:</strong> the count for a value is found in constant expected time, so one pass suffices.</p>
  </>} />
}
