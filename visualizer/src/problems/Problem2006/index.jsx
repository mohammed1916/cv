import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2006',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums and k (JSON)',
  url: 'https://leetcode.com/problems/count-number-of-pairs-with-absolute-difference-k/',
  complexity: 'O(n) expected time with a hash map of counts.',
  examples: [
    { label: 'Small gap', input: '{"nums":[3,1,4,1,5],"k":2}' },
    { label: 'Repeated values', input: '{"nums":[2,2,2],"k":1}' },
    { label: 'Large gap', input: '{"nums":[10,20,30],"k":10}' },
  ],
}

export default function CountPairsWithDifferenceK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, index, k, counts, pairs, gained } = step.snapshot
    return <>
      <div aria-label="Values in order" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {nums.map((v, i) => <span key={i} style={{
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', color: 'var(--text)',
          background: i < index ? 'var(--surface2)' : 'transparent',
        }}>{v}</span>)}
      </div>
      <p>Current value <strong>{index >= 0 ? nums[index] : '-'}</strong> looks for <strong>{index >= 0 ? `${nums[index] - k} and ${nums[index] + k}` : '-'}</strong>; new pairs here: <strong>{gained}</strong>.</p>
      <p>Counts seen: {counts.length ? counts.map(([v, c]) => `${v}×${c}`).join(' · ') : 'none'}. Total pairs: <strong>{pairs}</strong>.</p>
    </>
  }} renderReasoning={() => <p>For each value, only earlier values exactly k below or above it can form a pair, so a count table answers each lookup directly.</p>} />
}
