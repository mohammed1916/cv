import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1982',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Length n and all 2^n subset sums (JSON)',
  url: 'https://leetcode.com/problems/find-array-given-subset-sums/',
  complexity: 'Worst case exponential in n through the guesses; each guess splits 2^n sums in O(2^n log 2^n) time.',
  examples: [
    { label: 'Positive pair', input: '{"n":2,"sums":[-2,0,3,5]}' },
    { label: 'Three elements', input: '{"n":3,"sums":[-1,0,3,4,6,7,10,11]}' },
  ],
}

export default function FindArrayGivenSubsetSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { n, remaining, x, half, chosen, status } = step.snapshot
    const chip = (value, key) => <span key={key} style={{
      border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', color: 'var(--text)',
      background: value === x ? 'var(--primary-glow)' : 'var(--surface2)',
    }}>{value}</span>
    return <>
      <p>Elements still to recover: <strong>{n - chosen.length}</strong>. Accepted so far: <strong>{chosen.length ? chosen.join(', ') : 'none'}</strong></p>
      <div aria-label="Remaining sums" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {remaining.map((value, i) => chip(value, i))}
      </div>
      {x !== null && <p>Guess <strong>x = {x}</strong>: {status === 'fails' ? 'a sum has no partner shifted by x, so the guess is rejected.' : `the half for the other elements is [${half.join(', ')}].`}</p>}
    </>
  }} renderReasoning={() => <p>Every subset either omits an element or includes it, so the sums are a set S together with S shifted by that element. Peeling pairs from the smallest end (or largest, for a negative guess) recovers the half for the other elements.</p>} />
}
