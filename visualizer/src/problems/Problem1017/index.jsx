import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

export default function NegativeBaseVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Digit state">
      <p>Current value: {step.snapshot.value ?? step.snapshot.n}</p>
      <p>Digits from least significant: <code>{step.snapshot.digits.join(' ') || 'none yet'}</code></p>
      {step.snapshot.result !== undefined && <output>Representation: {step.snapshot.result}</output>}
    </section>}
    renderReasoning={() => <p>Each step removes the digit that makes the remaining value even, then divides by negative two. The division may flip the sign, but every recorded digit stays 0 or 1.</p>} />
}
