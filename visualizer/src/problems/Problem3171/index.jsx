import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subarray has been compared yet.' },
    { id: 'extend', label: 'Extend ORs', description: 'Combine the new value with every OR ending at the previous index.' },
    { id: 'best', label: 'Closer to k', description: 'This OR value is the closest to k so far.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 20 values, 1 to 255) and k (1 to 255), e.g. {"nums":[1,2,4,5],"k":3}',
  url: 'https://leetcode.com/problems/find-subarray-with-bitwise-or-closest-to-k/',
  complexity: 'O(n * log V) time and O(log V) space, since each end index keeps at most log V distinct ORs. The visualization caps the input at 20 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,4,5],"k":3}' },
    { label: 'Example 2', input: '{"nums":[1,3,1,3],"k":2}' },
  ],
}

export default function ClosestSubarrayOr() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <output aria-label="Distinct ORs ending here">{`ORs ending at ${step.index < 0 ? '-' : step.index}: ${step.ors.join(', ') || '(none)'}`}</output>
    <output aria-label="Best distance">{`Best distance to ${run.input.k}: ${step.best ?? 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>As the subarray's left end moves left, its OR can only gain bits, and there are at most about 8 distinct values for 8-bit numbers.</p>
    <p>Tracking those distinct values for each right end covers every subarray without listing them all.</p>
  </>} />
}
