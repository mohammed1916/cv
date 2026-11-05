import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2028',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Observed rolls, mean and n (JSON)',
  url: 'https://leetcode.com/problems/find-missing-observations/',
  complexity: 'O(n) time to build the missing rolls.',
  examples: [
    { label: 'Even split', input: '{"rolls":[1,6,1],"mean":3,"n":2}' },
    { label: 'Remainder', input: '{"rolls":[2,3],"mean":2,"n":3}' },
    { label: 'Impossible', input: '{"rolls":[6,6],"mean":6,"n":3}' },
  ],
}

export default function FindMissingObservations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { rolls, n, total, observed, missing, values, feasible } = step.snapshot
    return <>
      <p>Observed rolls: <strong>{rolls.join(', ')}</strong> (sum {observed}). Total needed: <strong>{total}</strong>, so the missing rolls must sum to <strong>{missing}</strong>.</p>
      <p>Range for {n} dice: from {n} to {6 * n}; {feasible ? 'the sum fits.' : 'the sum does not fit.'}</p>
      {feasible && <div aria-label="Missing rolls" style={{ display: 'flex', gap: 6 }}>
        {values.map((v, i) => <span key={i} style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '2px 10px', fontFamily: 'monospace', color: 'var(--text)' }}>{v}</span>)}
      </div>}
    </>
  }} renderReasoning={() => <p>The average of all rolls fixes their total, so the missing total is known. Spreading it as evenly as possible keeps every die between 1 and 6 when the total is in range.</p>} />
}
