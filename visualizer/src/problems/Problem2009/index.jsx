import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2009',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer array (JSON)',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-make-array-continuous/',
  complexity: 'O(n log n) time for the sort and O(n) for the two-pointer window.',
  examples: [
    { label: 'Already spread', input: '[10,11,12,13]' },
    { label: 'Gap', input: '[1,2,4,9,10]' },
    { label: 'Wide', input: '[5,50,100]' },
  ],
}

export default function MinimumOperationsContinuous() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { values, l, r, count, best, bestWindow, n } = step.snapshot
    return <>
      <div aria-label="Distinct sorted values" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {values.map((v, i) => {
          const inside = l >= 0 && i >= l && i <= r
          return <span key={i} style={{
            border: `${i === l || i === r ? 2 : 1}px solid ${inside ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', color: 'var(--text)',
            background: inside ? 'var(--primary-glow)' : 'transparent',
          }}>{v}{i === l ? ' l' : ''}{i === r ? ' r' : ''}</span>
        })}
      </div>
      <p>Window length target <strong>n = {n}</strong>: values from <strong>{l >= 0 ? values[l] : '-'}</strong> to <strong>{r >= 0 ? values[r] : '-'}</strong> keep <strong>{count}</strong>.</p>
      <p>Best so far: keep {n - best} values, replace <strong>{best}</strong>{bestWindow ? ` (window ${bestWindow[0]} to ${bestWindow[1]})` : ''}.</p>
    </>
  }} renderReasoning={() => <p>The final array is n consecutive integers. Keep the most distinct values that fit in a span of n, which a two-pointer window over the sorted distinct values finds.</p>} />
}
