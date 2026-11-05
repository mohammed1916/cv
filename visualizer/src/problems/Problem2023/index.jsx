import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2023',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digit strings and target (JSON)',
  url: 'https://leetcode.com/problems/number-of-pairs-of-strings-with-concatenation-equal-to-target/',
  complexity: 'O(n^2) pairs, each concatenation takes O(length) time.',
  examples: [
    { label: 'Two strings', input: '{"nums":["4","44","8"],"target":"448"}' },
    { label: 'Split target', input: '{"nums":["1","23","2","3"],"target":"123"}' },
    { label: 'Repeats', input: '{"nums":["9","9"],"target":"99"}' },
  ],
}

export default function PairsConcatenationEqualTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, target, i, j, joined, count } = step.snapshot
    return <>
      <p>Target <strong>{target}</strong>. Current pair: {i >= 0 ? <strong>({i}, {j})</strong> : '-'}</p>
      <p>{i >= 0 ? <>Concatenation <strong>{nums[i]}</strong> + <strong>{nums[j]}</strong> = <strong>{joined}</strong>{joined === target ? ' (match)' : ''}</> : 'No pair checked yet.'}</p>
      <div aria-label="Strings by index" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {nums.map((s, k) => <span key={k} style={{
          border: `${k === i || k === j ? 2 : 1}px solid ${k === i || k === j ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', color: 'var(--text)',
        }}>[{k}] {s}</span>)}
      </div>
      <p>Matching ordered pairs so far: <strong>{count}</strong>.</p>
    </>
  }} renderReasoning={() => <p>Each ordered pair of different indices is joined in order, and only the pairs whose join equals the target are counted.</p>} />
}
