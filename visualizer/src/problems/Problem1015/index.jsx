import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Chips({ label, values }) {
  return <div>
    <strong>{label}</strong>{' '}
    {values.length === 0 ? <span>none yet</span> : values.map((value, index) => <code key={`${index}-${value}`}>{value} </code>)}
  </div>
}

export default function SmallestRepunitVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Remainder state">
      <p>k = {step.snapshot.k}</p>
      <p>Length: {step.snapshot.length} · Remainder: {step.snapshot.remainder}</p>
      <Chips label="Remainders seen:" values={step.snapshot.seen} />
      {step.snapshot.result !== undefined && <output>Answer: {step.snapshot.result}</output>}
    </section>}
    renderReasoning={({ step }) => <p>Only the remainder is kept. Appending a one maps the old remainder to (remainder times 10 plus 1) mod k. A repeated nonzero remainder means the sequence cycles without reaching zero.</p>} />
}
