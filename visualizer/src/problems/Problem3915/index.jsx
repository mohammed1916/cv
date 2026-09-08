import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import SubsequencePath from '../../components/shared/SubsequencePath'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'nums and k (JSON object)',
  url: 'https://leetcode.com/problems/maximum-sum-of-alternating-subsequence-with-distance-at-least-k/',
  complexity: 'O(n log U + U) time and O(n + U) space, U = max(nums). Two Fenwick prefix-maximum trees enforce strict value comparisons; delayed insertion enforces distance. Trace storage is O(n).',
  phases: [
    { id: 'start', label: 'Input', description: 'Initialize rising and falling DP states.' },
    { id: 'activate', label: 'Activate', description: 'Insert index i − k into the eligible predecessor trees.' },
    { id: 'rise', label: 'Query smaller ↑', description: 'Extend a falling state with a strictly smaller endpoint.' },
    { id: 'fall', label: 'Query larger ↓', description: 'Extend a rising state with a strictly larger endpoint.' },
    { id: 'done', label: 'Complete', description: 'Reconstruct an optimal alternating path.' },
  ],
  examples: [
    { label: 'Distance two', input: '{"nums":[5,4,2],"k":2}' },
    { label: 'Alternating path', input: '{"nums":[3,5,4,2,4],"k":1}' },
    { label: 'Equal values', input: '{"nums":[5,5,5,5],"k":1}' },
    { label: 'Singleton', input: '{"nums":[5],"k":1}' },
  ],
}

export default function AlternatingSubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const known = (index, direction) => step.phase === 'done' || index < step.index || index === step.index && (step.phase === 'fall' || direction === 'up' && step.phase === 'rise')
    return <>
      <IndexedSequence label="Distance eligibility and predecessor" length={run.input.length} active={step.index} valueAt={i => run.input[i]}
        roleAt={i => step.phase === 'done' ? 'complete' : i === step.candidate ? 'predecessor' : i <= step.eligible ? 'eligible' : i < step.index ? 'too close' : 'unprocessed'} />
      <IndexedSequence label="UP: best sum ending with a rise" length={run.input.length} active={step.phase === 'rise' ? step.index : -1}
        valueAt={i => known(i, 'up') ? run.up[i] : '?'} />
      <IndexedSequence label="DOWN: best sum ending with a fall" length={run.input.length} active={step.phase === 'fall' ? step.index : -1}
        valueAt={i => known(i, 'down') ? run.down[i] : '?'} />
      <output aria-label="Maximum alternating sum">{step.phase === 'done' ? 'Maximum sum' : 'Best completed sum'}: {step.result}</output>
      {step.phase === 'done' && <SubsequencePath values={run.input} indices={run.path} minGap={run.k} />}
    </>
  }} renderReasoning={({ run, step }) => <>
    <p>UP[i] = nums[i] + best DOWN[j] with j ≤ i − k and nums[j] &lt; nums[i]. DOWN swaps the direction and uses nums[j] &gt; nums[i].</p>
    <p>Zero query results start singletons; equal values cannot extend either state. The score is the sum of values, not an alternating-sign sum.</p>
    {['rise', 'fall'].includes(step.phase) && <table><caption>Current DP transition</caption><tbody>
      <tr><th>Eligible index range</th><td>{step.eligible < 0 ? 'empty' : `0..${step.eligible}`}</td></tr>
      <tr><th>Strict value range</th><td>{step.phase === 'rise' ? `< ${run.input[step.index]}` : `> ${run.input[step.index]}`}</td></tr>
      <tr><th>Best opposite-state endpoint</th><td>{step.candidate < 0 ? 'none: start singleton' : `[${step.candidate}], value ${run.input[step.candidate]}`}</td></tr>
      <tr><th>Transition sum</th><td>{step.candidateScore} + {run.input[step.index]} = {step.score}</td></tr>
    </tbody></table>}
    <p>Fenwick trees summarize the best endpoint over value ranges. Reversing value coordinates turns a greater-than query into another prefix query. Each endpoint is inserted only when it becomes far enough away.</p>
  </>} />
}
