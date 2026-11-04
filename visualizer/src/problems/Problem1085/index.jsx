import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function MinimumDigitSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { values, smallest, index, digits, total } = step.state
    const minIndex = values.indexOf(smallest)
    const pointers = { min: minIndex }
    if (index !== null && index !== undefined) pointers.i = index
    return <>
      <Sequence label="Values (min pointer marks the smallest so far)" values={values} pointers={pointers} />
      <Vars vars={{ 'smallest so far': smallest, 'i (scan)': index, 'digits': digits.length ? digits.join(' + ') : null, 'digit sum': digits.length ? total : null }} />
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>
  }} renderReasoning={() => <p>The scan keeps only the smallest value. Its digit sum decides the answer: one when that sum is even, zero when it is odd.</p>} />
}
