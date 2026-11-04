import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function MinimumSwapsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const pointers = {}
    const marks = {}
    if (s.start !== null && s.start !== undefined) {
      pointers.l = s.start
      pointers.r = s.start + s.ones - 1
      for (let i = s.start; i <= s.start + s.ones - 1; i++) marks[i] = 'window'
    }
    return <>
      <Sequence label={`Binary array; window of width ${s.ones}`} values={s.bits} pointers={pointers} marks={marks} />
      <Vars vars={{ 'ones (window width)': s.ones, 'l (window start)': s.start, 'r (window end)': s.start === null ? null : s.start + s.ones - 1, 'ones inside': s.inside, 'best inside': s.best }} />
      <output aria-label="Ones inside window">{step.message}</output>
      {run.result !== undefined && step.phase === 'done' && <p>Result: {run.result} swaps</p>}
    </>
  }} renderReasoning={() => <p>The final block is as wide as the number of ones. Each zero inside the chosen block has to be exchanged with a one from outside, so the best block is the window that already holds the most ones.</p>} />
}
