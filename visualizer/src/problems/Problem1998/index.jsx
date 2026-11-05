import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1998',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Positive integers (JSON)',
  url: 'https://leetcode.com/problems/gcd-sort-of-an-array/',
  complexity: 'Factorisation by trial division plus near-constant union-find operations on the primes.',
  examples: [
    { label: 'Shared factor', input: '[6,9,4,8]' },
    { label: 'Isolated one', input: '[1,3,2]' },
    { label: 'Mixed', input: '[12,18,5,25,15]' },
  ],
}

export default function GcdSortOfArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, sorted, index, groups } = step.snapshot
    const targetValues = sorted ?? []
    return <>
      <div aria-label="Original array" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((v, i) => <span key={i} style={{
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', color: 'var(--text)',
        }}>{v}</span>)}
      </div>
      <p>Groups formed by shared primes: {groups.length ? groups.map(g => `{${g.join(', ')}}`).join('  ') : 'none (values with no shared prime cannot move)'}</p>
      {targetValues.length > 0 && <p>Target order: {targetValues.join(', ')}</p>}
    </>
  }} renderReasoning={() => <p>Two values can swap only when they share a prime factor, directly or through a chain. Each position must receive a value from its own group, so the group sums must match in order.</p>} />
}
