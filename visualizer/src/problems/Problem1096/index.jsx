import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

function WordSet({ label, words }) {
  return <div aria-label={label}>
    <strong>{label}</strong>: {words.length ? `{${words.map(word => word === '' ? 'ε' : word).join(', ')}}` : '{ }'}
  </div>
}

export default function BraceVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <p>Depth {step.snapshot.depth} · Position {step.snapshot.pos} of {step.snapshot.expression.length}</p>
      <WordSet label="Product (prefixes)" words={step.snapshot.product} />
      <WordSet label="Union (finished alternatives)" words={step.snapshot.union} />
      {step.snapshot.inner && <WordSet label="Nested group result" words={step.snapshot.inner} />}
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result.join(', ')}` : step.message}</output>
    </>}
    renderReasoning={() => <p>Each group is solved on its own. Commas start a new alternative whose words join the union, while adjacent pieces extend every prefix in the product. A nested group finishes before its words extend the outer prefixes.</p>} />
}
