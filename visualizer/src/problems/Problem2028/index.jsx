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
    { label: 'Impossible', input: '{"rolls":[6,6],"mean":6,"n":3}' }, { label: "Single die", input: "{\"rolls\":[4],\"mean\":4,\"n\":1}" }, { label: "Equal rolls", input: "{\"rolls\":[3,3],\"mean\":3,\"n\":2}" }, { label: "Largest faces", input: "{\"rolls\":[6,1,6,1],\"mean\":6,\"n\":30}" }, { label: "Long run: 30 rolls", input: "{\"rolls\":[4,5,6,4,5,2,1,3,1,2,1,3,2,4,5,1,1,6,6,5,6,2,6,3,5,3,4,5,1,3],\"mean\":4,\"n\":30}" },
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
