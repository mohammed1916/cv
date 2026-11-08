import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1447',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Largest denominator n',
  url: 'https://leetcode.com/problems/simplified-fractions/',
  complexity: 'O(n^2 log n) time for every pair of numerator and denominator, with O(n^2) output.',
  examples: [
    { label: 'Six', input: '6' },
    { label: 'Two', input: '2' },
    { label: 'Eight', input: '8' },
    { label: 'Smallest: 1', input: '1' },
    { label: 'Largest allowed: 100', input: '100' },
    { label: 'Long run: 97', input: '97' },
  ],
}

export default function SimplifiedFractions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { n, den, num, g, kept, recent } = step.snapshot
    return <>
      <p>Denominator limit n = {n}. Current candidate: {num !== null && den !== null ? `${num}/${den}` : 'none yet'}</p>
      <p>{g !== null ? `gcd(${num}, ${den}) = ${g}` : 'gcd appears once a numerator is checked.'}</p>
      <p>Kept so far: {kept}</p>
      <div role="list" aria-label="Recently kept fractions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {recent.map((f, i) => <span key={i} role="listitem" style={{ border: '1px solid var(--border)', padding: '2px 6px', fontFamily: 'monospace' }}>{f}</span>)}
      </div>
      <p>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Lowest terms:</strong> a/b is reduced exactly when a and b share no common factor above 1.</p>
    <p>{step.snapshot.g === 1 ? 'The gcd is 1, so the fraction is kept.' : step.snapshot.g > 1 ? 'The gcd is above 1, so the fraction is skipped.' : 'Choose the next candidate to check.'}</p>
  </>} />
}
