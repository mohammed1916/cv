import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

function ValueRow({ snapshot }) {
  return <ol aria-label="Sorted values" style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
    {snapshot.sorted.map((value, index) => {
      const marks = [index === snapshot.left && 'left', index === snapshot.right && 'right'].filter(Boolean).join(' / ')
      const inPair = index === snapshot.left || index === snapshot.right
      return <li key={index} style={{ border: '2px solid', borderColor: inPair ? '#0891b2' : '#94a3b8', borderRadius: 8, padding: '6px 10px', minWidth: 44, textAlign: 'center' }}>
        <strong>{value}</strong>
        <div style={{ fontSize: 12 }}>{marks || `#${index}`}</div>
      </li>
    })}
  </ol>
}

export default function ValuePairVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <ValueRow snapshot={step.snapshot} />
      <p>Limit: {step.snapshot.limit} · Best so far: {step.snapshot.best}{step.snapshot.total !== undefined ? ` · Current sum: ${step.snapshot.total}` : ''}</p>
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>}
    renderReasoning={() => <p>Sorting makes the two ends the smallest and largest candidates. A sum that is too large can only be reduced by moving the right pointer, while a valid sum is recorded and the left pointer moves to look for a larger one.</p>} />
}
