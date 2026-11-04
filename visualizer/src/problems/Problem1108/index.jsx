import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function DefangVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const s = step.snapshot
      const pointers = s.index >= 0 && s.index < s.address.length ? { read: s.index } : {}
      return <>
        <Sequence label="Input address" values={[...s.address]} pointers={pointers} />
        <Sequence label="Output so far" values={[...s.rendered]} marks={{}} />
        <Vars vars={{ 'read position': s.index >= 0 ? s.index : null, 'output length': s.rendered.length }} />
        <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
      </>
    }}
    renderReasoning={() => <p>Digits pass through unchanged, and each separator is replaced by three characters. The output is longer than the input, so the rewrite is built into a new string.</p>} />
}
