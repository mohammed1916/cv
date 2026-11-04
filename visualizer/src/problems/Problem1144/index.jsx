import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function ZigzagDecrementsVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const s = step.snapshot
      const values = s.nums
      const marks = {}
      if (s.roles) s.roles.forEach((role, i) => { marks[i] = role === 'valley' ? 'written' : '' })
      const pointers = s.index === null || s.index === undefined ? {} : { i: s.index }
      return <>
        <Sequence label={s.start === null ? 'Values' : `Valleys at ${s.start % 2 === 0 ? 'even' : 'odd'} positions (green)`} values={values} pointers={pointers} marks={marks} />
        <Vars vars={{ 'valley i': s.index, 'smallest neighbour': s.lower, 'moves for this valley': s.cut, 'cost of pattern so far': s.total }} />
        <output aria-label="Running cost">{step.phase === 'done' ? `Answer: ${run.result}` : step.message}</output>
      </>
    }}
    renderReasoning={() => <p>Valleys never sit next to each other, so each valley only needs to stay below its own neighbours. Price each pattern separately and keep the cheaper one.</p>} />
}
