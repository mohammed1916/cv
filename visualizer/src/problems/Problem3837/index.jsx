import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DelayedCountView from './DelayedCountView'
import { buildTrace, parseInput, code, python } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  phases: [
    { id: 'start', label: 'Sweep', description: 'Sweep i from the right end toward the left.' },
    { id: 'add', label: 'Add', description: 'Index i plus k plus one joins the delayed region.' },
    { id: 'count', label: 'Count', description: 'Read how many equal values sit in the region.' },
    { id: 'done', label: 'Result', description: 'Report the counts in index order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers) and k',
  url: 'https://leetcode.com/problems/delayed-count-of-equal-elements/',
  complexity: 'O(n) time and O(n) space with a running tally that grows as the sweep moves left. The visualization caps nums at 14 values.',
  examples: [
    { label: 'Repeated fours', input: '{"nums":[4,4,7,4,7,4,1,7],"k":2}' },
    { label: 'Negative values, k zero', input: '{"nums":[-3,0,-3,-3,0],"k":0}' },
  ],
}

export default function DelayedCountOfEqualElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <><IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => i === step.i ? 'i' : i === step.j ? 'j' : step.window && i >= step.window[0] && i <= step.window[1] ? 'window' : ''} /><DelayedCountView run={run} step={step} /></>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>The valid indices for position i form a suffix starting at i plus k plus one. As i moves left that suffix only grows, so one tally updated by a single addition per step is enough.</p>
    {run ? <p>Final answer: {run.result.join(', ')}.</p> : null}
  </>} />
}
