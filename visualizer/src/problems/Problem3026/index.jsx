import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no recorded starts.' },
    { id: 'scan', label: 'Scan ends', description: 'Record the start at this index, then check the two partner values.' },
    { id: 'done', label: 'Complete', description: 'Report the best good subarray sum, or 0.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums (2 to 12 integers from -10 to 10) and k (1 to 10)',
  url: 'https://leetcode.com/problems/maximum-good-subarray-sum/',
  complexity: 'O(n) time with a map keyed by value. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4,5,6],"k":1}' },
    { label: 'Example 2', input: '{"nums":[-1,3,2,4,5],"k":3}' },
  ],
}

export default function MaximumGoodSubarraySum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => run.input.nums[index] - run.input.k === run.input.nums[step.index] || run.input.nums[index] + run.input.k === run.input.nums[step.index] ? 'partner' : ''} />
    <output aria-label="Candidate">{`Candidate ${step.candidate ?? '(none)'}, best ${step.best ?? '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>A good subarray ends at j and starts at a value that is k below or above nums[j], so only the lowest prefix sum per value is needed.</p>
    <p>The prefix sum of a subarray is the end prefix minus the start prefix, so the lowest start gives the largest sum.</p>
  </>} />
}
