import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1994',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers from 1 to 30 (JSON)',
  url: 'https://leetcode.com/problems/the-number-of-good-subsets/',
  complexity: 'O(n + V * 2^P) time for the subset-of-primes DP, with V = 30 and P = 10 primes.',
  examples: [
    { label: 'Mixed values', input: '[2,3,6,7]' },
    { label: 'Repeated primes', input: '[4,6,10,15,1]' },
    { label: 'Only ones', input: '[1,1]' },
  ],
}

export default function NumberOfGoodSubsets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { value, states, ones, primes } = step.snapshot
    const label = mask => primes.filter((_, i) => mask & (1 << i)).join('·') || '1'
    return <>
      <p>Primes that can appear: <strong>{primes.join(', ')}</strong>. Each bit of a state marks a prime already used.</p>
      <div aria-label="Reachable prime sets" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {states.slice(0, 40).map(([state, ways]) => <span key={state} style={{
          border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', color: 'var(--text)',
          background: value !== null && state !== 0 ? 'var(--surface2)' : 'transparent',
        }}>{label(state)}: {ways}</span>)}
      </div>
      {states.length > 40 && <p>{states.length - 40} more states are not listed.</p>}
      <p>{value !== null ? `Value ${value} has been added.` : 'No value added yet.'} The number of 1s is <strong>{ones}</strong>, so the final count is doubled that many times.</p>
    </>
  }} renderReasoning={() => <p>A good subset's product is squarefree and above 1, so each value adds at most one of its copies and its primes must be unused so far. Tracking used primes as a bit mask counts these subsets.</p>} />
}
