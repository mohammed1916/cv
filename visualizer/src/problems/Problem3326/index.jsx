import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Scan', description: 'Start at the right-hand pair.' },
    { id: 'keep', label: 'Ordered', description: 'This pair already fits; no operation is needed.' },
    { id: 'divide', label: 'Divide', description: 'Replace the value by its smallest prime factor and count the operation.' },
    { id: 'stuck', label: 'Stuck', description: 'A prime cannot shrink further, so the answer is -1.' },
    { id: 'done', label: 'Result', description: 'Report the operation count or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (positive integers)',
  url: 'https://leetcode.com/problems/minimum-division-operations-to-make-array-non-decreasing/description/',
  complexity: 'O(n * sqrt(max value)) time for trial division, O(1) extra space beyond the working copy.',
  examples: [
    { label: 'Example', input: '{"nums":[12,9,8]}' },
    { label: 'Stuck prime', input: '{"nums":[5,5,4]}' },
    { label: 'Single value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[7,7]}' },
    { label: 'Largest allowed values', input: '{"nums":[1000000,999999,2]}' },
    { label: 'Long run: 12 values', input: '{"nums":[845298,427526,607113,400534,729421,501695,550476,382929,581914,617508,51081,491451]}' },
  ],
}

export default function MinimumDivisionOperationsToMakeArrayNonDecreasing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <div aria-label="Array values" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
      {run.input.nums.map((v, i) => {
        const active = i === step.index
        const next = step.index !== null && i === step.index + 1
        return <div key={i} style={{ minWidth: 56, padding: '8px 10px', textAlign: 'center', borderRadius: 6, border: '2px solid #7c3aed', background: active ? '#7c3aed' : next ? 'rgba(124,58,237,0.2)' : 'transparent', color: active ? '#fff' : 'inherit' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>index {i}</div>
          <strong>{active ? step.value : v}</strong>
        </div>
      })}
    </div>
    <div aria-label="Division chain" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, margin: '8px 0', color: 'var(--text)' }}>
      {step.chain && step.chain.length > 1 ? <>
        {step.chain.map((v, i) => <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {i > 0 && <span aria-hidden="true" style={{ color: 'var(--muted, var(--text))' }}>→</span>}
          <span style={{ padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', border: '1px solid var(--surface2, #d1d5db)', background: i === step.chain.length - 1 ? 'var(--primary, #2563eb)' : 'var(--surface2, transparent)', color: i === step.chain.length - 1 ? '#fff' : 'var(--text)' }}>{v}</span>
        </span>)}
        <span style={{ marginLeft: 8, color: 'var(--muted, var(--text))' }}>must be at most {step.next} (the right neighbour)</span>
      </> : <span>{step.message}</span>}
    </div>
    <output aria-label="Step message" style={{ color: 'var(--text)' }}>{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Dividing by the greatest proper divisor always lands on the smallest prime factor, so a value can only walk down a fixed chain of smaller values.</p>
    <p>Scanning from the right and lowering each value just enough to fit its right neighbour keeps the most room for the values on its left.</p>
  </>} />
}
