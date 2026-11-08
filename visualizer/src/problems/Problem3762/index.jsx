import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'window', label: 'Piece', description: 'Take the values of this query.' },
    { id: 'mismatch', label: 'Mismatch', description: 'Two values have different remainders, so the answer is -1.' },
    { id: 'median', label: 'Median', description: 'Divide by k, sort the levels and pay the distance to the middle level.' },
    { id: 'done', label: 'Result', description: 'Every query has its answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, k and queries ([l, r] pairs)',
  url: 'https://leetcode.com/problems/minimum-operations-to-equalize-subarrays/',
  complexity: 'O(q * w log w) time for q queries of window length w, in the teaching version. A faster version would use prefix counts of remainder changes and order statistics. The visualization caps nums at 10 values.',
  examples: [
    { label: 'Example', input: '{"nums":[2,5,8,11],"k":3,"queries":[[0,3],[1,2]]}' },
    { label: 'Mismatch', input: '{"nums":[2,5,6,9],"k":3,"queries":[[0,2],[2,3]]}' },
    { label: "Single value", input: "{\"nums\":[7],\"k\":1,\"queries\":[[0,0]]}" },
    { label: "Equal values", input: "{\"nums\":[6,6,6,6],\"k\":2,\"queries\":[[0,3]]}" },
    { label: "Maximum k on alternating values", input: "{\"nums\":[30,1,30,1,30,1,30,1,30,1],\"k\":10,\"queries\":[[0,9],[0,4]]}" },
    { label: "Long run: 10 values, 6 queries", input: "{\"nums\":[13,7,25,17,10,22,25,1,8,1],\"k\":5,\"queries\":[[8,8],[0,3],[0,1],[0,4],[5,5],[3,5]]}" },
  ],
}

export default function MinimumOperationsToEqualizeSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.span && i === step.span[0] ? 'l' : step.span && i === step.span[1] ? 'r' : step.span && i > step.span[0] && i < step.span[1] ? 'window' : '')} />
    {step.level && <IndexedSequence label="sorted levels (value divided by k)" length={step.level.length} valueAt={i => step.level[i]} active={Math.floor(step.level.length / 2)}
      roleAt={i => (i === Math.floor(step.level.length / 2) ? 'median' : '')} />}
    <output aria-label="Equalizing cost">{step.level
      ? `Levels ${step.level.join(', ')}; target ${step.mid}; cost ${step.answer}`
      : step.answer === -1 ? 'Remainders differ: -1' : `k = ${run.input.k}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation moves a value by k, so values can meet only when they share a remainder mod k. Dividing by k turns each value into a level.</p>
    <p>The median level minimizes the total distance to a common level, so its sum of distances is the cost.</p>
  </>} />
}
