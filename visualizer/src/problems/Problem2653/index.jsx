import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally the negative values of the current window by magnitude.' },
    { id: 'pick', label: 'Pick', description: 'Scan from the most negative value upward until x negatives are reached.' },
    { id: 'done', label: 'Complete', description: 'Report the beauty of every window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 40 values from -50 to 50), k and x, for example {"nums":[1,-1,-3,-2,3],"k":3,"x":2}',
  url: 'https://leetcode.com/problems/sliding-subarray-beauty/',
  complexity: 'O(n * (k + 50)) time with a fixed-size tally of negative values. The visualization caps nums at 40 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,-1,-3,-2,3],"k":3,"x":2}' },
    { label: 'Example 3', input: '{"nums":[-3,1,2,-3,0,-3],"k":2,"x":1}' },
  ],
}

export default function SlidingSubarrayBeauty() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.right}
      roleAt={index => (step.right >= 0 && step.left <= index && index <= step.right ? 'window' : '')} />
    <output aria-label="Beauty values">{`Beauty of each window so far: [${step.results.join(', ')}]${step.beauty === null ? '' : `. This window: ${step.beauty}`}`}</output>
  </>} renderReasoning={() => <>
    <p>The beauty of a window is its x-th smallest negative value, or 0 when it has fewer than x negatives.</p>
    <p>Values lie between -50 and -1 for negatives, so a tally indexed by magnitude replaces sorting each window.</p>
  </>} />
}
