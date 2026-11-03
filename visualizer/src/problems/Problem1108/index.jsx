import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

function Strip({ label, chars, highlight }) {
  return <div aria-label={label} style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontFamily: 'monospace' }}>
    {chars.map((ch, index) => <span key={index} style={{
      border: '2px solid', borderColor: index === highlight ? '#0891b2' : '#94a3b8', borderRadius: 6, padding: '2px 6px',
    }}>{ch}</span>)}
  </div>
}

export default function DefangVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <Strip label="Input address" chars={[...step.snapshot.address]} highlight={step.snapshot.index} />
      <Strip label="Output so far" chars={[...step.snapshot.rendered]} highlight={-1} />
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>}
    renderReasoning={() => <p>Digits pass through unchanged, and each separator is replaced by three characters. The output is longer than the input, so the rewrite builds a new string rather than editing in place.</p>} />
}
