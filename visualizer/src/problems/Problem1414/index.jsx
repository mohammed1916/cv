import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1414',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Target value k (integer)',
  url: 'https://leetcode.com/problems/find-the-minimum-number-of-fibonacci-numbers-whose-sum-is-k/',
  complexity: 'O(log k) time for the greedy picks and Fibonacci list, since the values grow exponentially.',
  examples: [
    { label: 'Target 7', input: '7' },
    { label: 'Target 19', input: '19' },
    { label: 'Exact Fibonacci', input: '21' },
  ],
}

export default function FibonacciSumCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { remaining, picks, fibs, chosen } = step.snapshot
    return <>
      <p>Remaining: <strong>{remaining}</strong> · Picks so far: {picks.length ? picks.join(' + ') : 'none'}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {fibs.map(f => <div key={f} style={{
          padding: 12, borderRadius: 6, fontFamily: 'monospace',
          border: '2px solid', borderColor: f === chosen ? 'var(--primary)' : 'var(--border)',
          background: f === chosen ? 'var(--surface2)' : undefined, color: 'var(--text)',
        }}>{f}</div>)}
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Take the largest fit.</strong> Fibonacci values grow fast, so the largest value not above the remainder leaves the smallest remainder to cover.</p>
    <p><strong>Why this is fewest.</strong> Every Fibonacci value up to k is a valid choice, and the greedy count matches the exhaustive optimum on every target tested.</p>
  </>} />
}
