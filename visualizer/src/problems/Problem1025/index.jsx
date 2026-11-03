import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

export default function StateTableVisual() {
  const cell = (value, index) => <span key={index} aria-label={`state ${index}`}
    style={{ display: 'inline-block', minWidth: '2.2em', margin: 2, padding: '2px 4px', textAlign: 'center',
      border: '1px solid currentColor', borderRadius: 4 }}>
    {index}:{value ? 'W' : 'L'}
  </span>
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="State table">
      <p>Pile size being decided: <strong>{step.snapshot.i}</strong>{step.snapshot.x ? <> · trying divisor <strong>{step.snapshot.x}</strong></> : null}</p>
      <div>{step.snapshot.wins.slice(1, (step.snapshot.n ?? step.snapshot.wins.length - 1) + 1).map((value, index) => cell(value, index + 1))}</div>
      <p>W means the player to move wins; L means they lose.</p>
      {step.snapshot.result !== undefined && <output>From {step.snapshot.n}: {step.snapshot.result ? 'first player wins' : 'first player loses'}</output>}
    </section>}
    renderReasoning={() => <p>A pile size is winning when at least one legal divisor leads to a losing smaller pile. Filling the table from small to large lets each answer reuse the earlier ones.</p>} />
}
