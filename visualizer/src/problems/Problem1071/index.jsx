import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function RepeatedBaseVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { first, second, a, b, joinedFirst, joinedSecond } = step.state
    const matches = joinedFirst === joinedSecond
    const marks = {}
    if (matches && a) for (let i = 0; i < a; i++) marks[i] = 'window'
    return <>
      <Sequence label="first (block shaded when a shared base exists)" values={[...first]} marks={marks} />
      <Sequence label="second" values={[...second]} marks={marks} />
      <Vars vars={{ 'first + second': joinedFirst, 'second + first': joinedSecond, 'a (length)': matches ? a : null, 'b (length)': matches ? b : null }} />
      <p aria-label="Order check">{matches ? 'The two orders match, so both strings are built from one block.' : 'The two orders differ, so no shared block exists.'}</p>
      <output aria-label="Result">{step.phase === 'done' ? `Result: "${run.result}"` : step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Commuting test:</strong> if the two joined orders are equal, both strings are built from one common block.</p>
    <p><strong>Largest block:</strong> the block length must divide both lengths, so the largest one is their greatest common divisor, found with Euclid.</p>
  </>} />
}
