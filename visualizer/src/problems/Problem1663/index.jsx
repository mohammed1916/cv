import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1663',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and k (JSON)',
  url: 'https://leetcode.com/problems/smallest-string-with-a-given-numeric-value/',
  complexity: 'O(n) time and O(n) space: one backward pass places the largest letter each position can take.',
  examples: [
    { label: 'Small budget', input: '{"n":2,"k":2}' },
    { label: 'Mixed letters', input: '{"n":5,"k":73}' },
    { label: 'Full alphabet', input: '{"n":3,"k":27}' },
  ],
}

const cell = { width: 40, height: 44, boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', display: 'grid', alignContent: 'center' }

export default function SmallestString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { chars, budget, position, value } = step.snapshot
    return <>
      <div role="img" aria-label="Positions and letters" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {chars.map((ch, i) => <div key={i} style={{
          ...cell,
          outline: position === i ? '2px solid var(--primary)' : 'none',
          background: ch === '?' ? 'transparent' : 'var(--surface2)', color: 'var(--text)',
        }}><span style={{ fontSize: '1.2rem' }}>{ch}</span><small>{i}</small></div>)}
      </div>
      <p>{value !== null ? `Value ${value} placed at position ${position}.` : 'Filled positions show their letters; ? means not yet placed.'}</p>
      <p>Budget left: {budget} · answer: <code>{run.result}</code></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Work from the end:</strong> a late position can absorb the largest value because earlier positions only need one unit each. Pushing value toward the end leaves the earliest letters as small as possible.</p>
    <p><strong>Feasibility:</strong> the remaining budget is always at least the number of earlier positions and at most 26 for each remaining position, so every step stays valid.</p>
  </>} />
}
