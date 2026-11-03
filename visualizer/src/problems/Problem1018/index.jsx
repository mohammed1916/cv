import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

export default function PrefixRemainderVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Prefix remainders">
      <p>Bits: <code>{step.snapshot.nums.map((bit, index) => index === step.snapshot.index ? `[${bit}]` : bit).join(' ')}</code></p>
      <p>Remainder modulo 5: <strong>{step.snapshot.remainder}</strong></p>
      <p>Flags so far: <code>{step.snapshot.answer.map(flag => (flag ? 'yes' : 'no')).join(' ') || 'none yet'}</code></p>
    </section>}
    renderReasoning={() => <p>The full prefix can be far too large to store. Keeping only its remainder works, because appending a bit doubles the old value and adds the bit, and both steps respect remainders modulo five.</p>} />
}
