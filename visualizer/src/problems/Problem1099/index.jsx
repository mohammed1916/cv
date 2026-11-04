import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function ValuePairVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const pointers = s.left < s.right ? { left: s.left, right: s.right } : {}
    return <>
      <Sequence label="Sorted values (two pointers)" values={s.sorted} pointers={pointers} />
      <p role="status">{step.phase === 'inspect' || step.phase === 'update'
        ? `Pair ${s.sorted[s.left]} + ${s.sorted[s.right]} = ${s.total}; ${s.total < s.limit ? 'below' : 'not below'} the limit ${s.limit}.`
        : step.message}</p>
      <Vars vars={{ left: s.left, right: s.right, 'current sum': s.total, limit: s.limit, 'best so far': s.best }} />
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>
  }} renderReasoning={() => <p>Sorting makes the two ends the smallest and largest candidates. A sum that is too large can only be reduced by moving the right pointer, while a valid sum is recorded and the left pointer moves to look for a larger one.</p>} />
}
