import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values with query index pairs (JSON)',
  url: 'https://leetcode.com/problems/arithmetic-subarrays/',
  complexity: 'O(q · m log m) time for q queries over subarrays of length m. The visualization accepts 6 queries and 20 values.',
  examples: [
    { label: 'Mixed', input: '{"nums":[8,2,14,20,5,11,17],"l":[0,1,4],"r":[2,6,6]}' },
    { label: 'Pairs', input: '{"nums":[4,1,7,10],"l":[0,1],"r":[2,3]}' },
    { label: 'Two queries', input: '{"nums":[9,-4,3,-10],"l":[0,0],"r":[3,1]}' },
  ],
}

export default function ArithmeticSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      roleAt={i => (step.segmentRange && i >= step.segmentRange[0] && i <= step.segmentRange[1] ? 'in-range' : '')} />
    <StackLane title="Sorted copy" items={(step.sorted ?? []).map(String)} note={step.gap != null ? `gap ${step.gap}` : undefined} />
  </>} renderReasoning={({ step }) => <>
    <p>An arithmetic progression has one common difference. Sorting the values exposes it: the neighbours of the sorted copy must all differ by the same amount.</p>
    <p>Each query is independent, so the sorted copy is rebuilt for each subarray and never reused between queries.</p>
    {step.answers?.length > 0 && <p>Answers so far: {step.answers.map(v => (v ? 'true' : 'false')).join(', ')}.</p>}
  </>} />
}
