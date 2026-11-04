import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function MajorityElementVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const pointers = {}
    if (s.lo < s.nums.length) pointers.lo = s.lo
    if (s.mid !== null) pointers.mid = s.mid
    const marks = {}
    for (let i = s.lo; i < s.hi; i++) marks[i] = 'window'
    if (s.boundary === 'count') for (let i = s.lo; i < s.hi; i++) marks[i] = 'written'
    return <>
      <Sequence label={`Sorted array, search range [${s.lo}, ${s.hi})`} values={s.nums} pointers={pointers} marks={marks} />
      <Vars vars={{ target: s.target, lo: s.lo, hi: s.hi, mid: s.mid, 'boundary': s.boundary ?? '-', 'copies': s.boundary === 'count' ? s.hi - s.lo : '-' }} />
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>
  }} renderReasoning={() => <p>Copies of the target form one block in a sorted array. Two binary searches find the block's edges, and the block's width decides whether it is more than half.</p>} />
}
