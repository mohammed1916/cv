import AlgorithmWorkspace from '../../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../../components/shared/IndexedSequence'
import { valueAtStep } from './algorithm'

export default function StableIndexWorkspace({ definition }) {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input and extremum witnesses" length={run.input.length} active={step.index} valueAt={i => run.input[i]}
      roleAt={i => i === step.minIndex && i === step.maxIndex ? 'min + max' : i === step.minIndex ? 'suffix min' : i === step.maxIndex ? 'prefix max' : ''} />
    <IndexedSequence label="Inclusive suffix minima ←" length={run.input.length} active={step.phase === 'suffix' ? step.index : -1}
      valueAt={i => valueAtStep(run, step, i, 'suffix')} />
    <IndexedSequence label="Inclusive prefix maxima →" length={run.input.length} active={step.phase === 'check' ? step.index : -1}
      valueAt={i => valueAtStep(run, step, i, 'prefix')} />
    <IndexedSequence label="Instability scores and threshold decisions" length={run.input.length} active={step.phase === 'check' ? step.index : -1}
      valueAt={i => valueAtStep(run, step, i, 'scores')}
      roleAt={i => i > step.checked ? 'not tested' : run.scores[i] <= run.k ? 'stable' : 'fails'} />
    {step.phase === 'done' && <output aria-label="Smallest stable index">Smallest stable index: {run.result}</output>}
  </>} renderReasoning={({ run, step }) => <>
    <p>Threshold k = {run.k}. Stability means prefix maximum − suffix minimum ≤ k. Equality passes.</p>
    {step.phase === 'check' && <table><caption>Inclusive ranges at index {step.index}</caption><tbody>
      <tr><th>Prefix [0..{step.index}]</th><td>Maximum {run.prefix[step.index]} at [{step.maxIndex}]</td></tr>
      <tr><th>Suffix [{step.index}..{run.input.length - 1}]</th><td>Minimum {run.suffix[step.index]} at [{step.minIndex}]</td></tr>
      <tr><th>Score</th><td>{run.prefix[step.index]} − {run.suffix[step.index]} = {step.score}</td></tr>
      <tr><th>Decision</th><td>{step.score <= run.k ? 'Stable: stop here' : 'Unstable: try next index'}</td></tr>
    </tbody></table>}
    <p>The current element belongs to both ranges. Scanning candidates in increasing index order proves the first match is the smallest; unknown cells remain “?” after an early return.</p>
    <p>Do not assume these scores are monotone: both extrema can increase at different times. This algorithm checks candidates in order, without binary search.</p>
  </>} />
}
