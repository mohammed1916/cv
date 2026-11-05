import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1985',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Decimal strings and k (JSON)',
  url: 'https://leetcode.com/problems/find-the-kth-largest-integer-in-the-array/',
  complexity: 'O(n log n) comparisons; each comparison takes O(length) characters.',
  examples: [
    { label: 'Third largest', input: '{"nums":["8","25","4","25"],"k":3}' },
    { label: 'Length beats digits', input: '{"nums":["99","100","7"],"k":2}' },
    { label: 'Duplicates count', input: '{"nums":["5","5","4"],"k":2}' },
  ],
}

export default function FindKthLargestInteger() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { ordered, k, position } = step.snapshot
    return <>
      <ol aria-label="Ascending order" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0 }}>
        {ordered.map((value, i) => <li key={i} style={{
          fontFamily: 'monospace', padding: '4px 8px', color: 'var(--text)',
          border: `${i === position ? 2 : 1}px solid ${i === position ? 'var(--primary)' : 'var(--border)'}`,
          background: i > position && position >= 0 ? 'var(--surface2)' : 'transparent',
        }}>{value}</li>)}
      </ol>
      <p>Counting down {k} places from the largest end lands on position <strong>{position >= 0 ? position : '-'}</strong>. Shaded values are the larger ones counted before the answer.</p>
    </>
  }} renderReasoning={() => <p>Numbers without leading zeros compare by length first and then character by character, which gives their numeric order.</p>} />
}
