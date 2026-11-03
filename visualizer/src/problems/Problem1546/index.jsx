import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const cell = { minWidth: 36, textAlign: 'center', border: '1px solid var(--border)', padding: 4, fontFamily: 'monospace' }

const definition = {
  number: '1546',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and target (JSON)',
  url: 'https://leetcode.com/problems/maximum-number-of-non-overlapping-subarrays-with-sum-equals-target/',
  complexity: 'O(n) time with a set of remembered prefix sums, and O(n) space in the worst case.',
  examples: [
    { label: 'Mixed signs', input: '{"nums":[1,-1,2,2,-2,2,2],"target":2}' },
    { label: 'All zeros', input: '{"nums":[0,0,0],"target":0}' },
    { label: 'No match', input: '{"nums":[5,5],"target":1}' },
  ],
}

export default function MaxNonOverlapping() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const { index, need, matched, seen, prefix, count } = step.snapshot
    return <>
      <div aria-label="Numbers" style={{ display: 'flex', gap: 6 }}>
        {nums.map((v, i) => <div key={i} style={{ ...cell, background: i === index ? 'var(--surface2)' : 'transparent', borderWidth: i === index ? 2 : 1 }}>{v}</div>)}
      </div>
      <p>Prefix sum: <strong>{prefix}</strong> · Subarrays taken: <strong>{count}</strong>{need !== undefined && <> · Prefix minus target: <strong>{need}</strong>{matched !== undefined && (matched ? ' (remembered)' : ' (not remembered)')}</>}</p>
      <p aria-label="Remembered prefixes">Remembered prefixes: {seen.map(v => <code key={v} style={{ marginRight: 6 }}>{v}</code>)}</p>
    </>
  }} renderReasoning={({ run }) => <>
    <p><strong>Why greedy works:</strong> among subarrays that sum to the target, always take the one that ends earliest. That leaves the largest possible suffix for later choices.</p>
    <p>Taking the target from the current prefix finds a start point. Forgetting earlier prefixes after each cut is what keeps the chosen subarrays disjoint.</p>
  </>} />
}
