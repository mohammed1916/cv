import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

const VERDICT = { above: 'above the upper limit: +1', below: 'below the lower limit: -1', inside: 'inside the limits: no change' }

export default function DietPlanPerformance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { values, window, start, total, score, sums, low, high, verdict } = step.snapshot
    const pointers = start === null ? {} : { l: start, r: start + window - 1 }
    const marks = {}
    if (start !== null) for (let i = start; i < start + window; i++) marks[i] = 'window'
    return <>
      <Sequence label={`Calories per day; window of ${window} days`} values={values} pointers={pointers} marks={marks} />
      <Vars vars={{ 'l (window start)': start, 'r (window end)': start === null ? null : start + window - 1, 'window total T': total, 'lower limit': low, 'upper limit': high, score }} />
      {verdict && <p role="status">{`T = ${total} is ${VERDICT[verdict]}.`}</p>}
      <p>Window totals so far: [{sums.join(', ')}]</p>
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Slide, do not re-add:</strong> moving the window changes its total by the value entering on the right minus the value leaving on the left.</p>
    <p><strong>Score:</strong> a total above the upper limit adds 1, a total below the lower limit subtracts 1, and anything in between changes nothing.</p>
  </>} />
}
