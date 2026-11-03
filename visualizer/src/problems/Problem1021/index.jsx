import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

export default function NestingDepthVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Nesting depth">
      <p>Input: <code>{step.snapshot.s.split('').map((ch, index) => index === step.snapshot.index ? `[${ch}]` : ch).join('')}</code></p>
      <p>Depth now: <strong>{step.snapshot.depth}</strong></p>
      <p>Kept so far: <code>{step.snapshot.kept || 'nothing yet'}</code></p>
    </section>}
    renderReasoning={() => <p>Depth marks the primitive boundaries. A bracket is dropped only when it opens from depth zero or closes back to depth zero; every other bracket belongs to the inside of a primitive section.</p>} />
}
