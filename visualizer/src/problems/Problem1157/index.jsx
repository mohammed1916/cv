import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the first query.' },
    { id: 'count', label: 'Count', description: 'Count the values inside the query range.' },
    { id: 'answer', label: 'Answer', description: 'Report the value whose count reaches the threshold, or -1.' },
    { id: 'done', label: 'Complete', description: 'All answers are ready.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: arr (values 0-9) and queries [left, right, threshold]',
  url: 'https://leetcode.com/problems/online-majority-element-in-subarray/',
  complexity: 'O(q * n) time for this counting visualization. The visualization caps input at 12 values and 6 queries.',
  examples: [
    { label: 'Example', input: '{"arr":[1,1,2,2,1,1],"queries":[[0,5,4],[0,3,3],[2,3,2]]}' },
  ],
}

export default function OnlineMajorityInSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.arr.length} valueAt={i => run.input.arr[i]} active={-1}
      roleAt={i => (step.range && i >= step.range[0] && i <= step.range[1] ? 'in range' : '')} />
    <output aria-label="Answers">{`Answers so far: [${step.answers.join(', ')}]`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A value occurring at least half of a range must be the only value that can reach a threshold above half the length, so the first value to reach the threshold is the answer.</p>
  </>} />
}
