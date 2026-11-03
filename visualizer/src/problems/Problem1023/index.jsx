import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

export default function PatternMatchVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Pattern matching state">
      <p>Pattern: <code>{step.snapshot.pattern}</code></p>
      {step.snapshot.query !== undefined && <p>Query: <code>{step.snapshot.query.split('').map((ch, index) => index === step.snapshot.index ? `[${ch}]` : ch).join('')}</code></p>}
      {step.snapshot.j !== undefined && <p>Pattern letters matched: <strong>{step.snapshot.j}</strong></p>}
      <p>Answers so far: <code>{step.snapshot.answer.map(flag => (flag ? 'yes' : 'no')).join(' ') || 'none yet'}</code></p>
    </section>}
    renderReasoning={() => <p>The pattern is consumed in order. A lowercase letter may be skipped as an insertion, but an uppercase letter must match the next pattern letter, otherwise the query fails.</p>} />
}
