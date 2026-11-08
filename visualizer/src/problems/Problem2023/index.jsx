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
    { label: 'Repeats', input: '{"nums":["9","9"],"target":"99"}' }, { label: "Two single digits", input: "{\"nums\":[\"1\",\"2\"],\"target\":\"12\"}" }, { label: "Equal pieces", input: "{\"nums\":[\"5\",\"5\",\"5\"],\"target\":\"555\"}" }, { label: "Longest pieces", input: "{\"nums\":[\"12345678\",\"87654321\"],\"target\":\"1234567887654321\"}" }, { label: "No way to build target", input: "{\"nums\":[\"3\",\"4\"],\"target\":\"99\"}" }, { label: "Long run: 30 pieces", input: "{\"nums\":[\"21\",\"27\",\"9\",\"87\",\"82\",\"5\",\"153\",\"4\",\"3\",\"8\",\"87\",\"2\",\"64\",\"7\",\"08\",\"5\",\"5\",\"3\",\"357\",\"0\",\"81\",\"447\",\"6\",\"770\",\"7\",\"1\",\"204\",\"247\",\"2\",\"15\"],\"target\":\"212798782\"}" },
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
