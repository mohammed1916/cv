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
    { label: 'Single element', input: '{"arr":[4],"queries":[[0,0,1]]}' },
    { label: 'Threshold equals the length', input: '{"arr":[1,1,1,1,2],"queries":[[0,3,4]]}' },
    { label: 'Boundary values 0 and 9', input: '{"arr":[9,9,0,9,0],"queries":[[0,3,3],[1,4,3]]}' },
    { label: 'Long run: 12 values, 6 queries', input: '{"arr":[2,0,4,7,4,0,6,9,2,1,4,1],"queries":[[10,11,2],[3,11,7],[6,10,3],[10,11,2],[8,10,3],[7,9,3]]}' },
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
