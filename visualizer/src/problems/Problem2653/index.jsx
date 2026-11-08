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
    { label: 'Own case 1', input: '{"nums":[2,-2,-4,-3,4],"k":4,"x":3}' },
    { label: 'Own case 2', input: '{"nums":[-4,2,3,-4,1,-4],"k":3,"x":2}' },
    { label: 'Single entry', input: '{"nums":[7],"k":1,"x":1}' },
    { label: 'Equal values tie', input: '{"nums":[2,2,2,2],"k":2,"x":1}' },
    { label: 'Boundary values -50 and 50', input: '{"nums":[-50,50,-50,50,0],"k":3,"x":3}' },
    { label: 'Long run: 40 entries', input: '{"nums":[-34,-35,5,31,34,4,-49,-6,-28,25,-20,20,-20,33,-18,-46,38,12,11,-15,-21,-18,15,15,26,-23,-48,40,-41,-26,-50,5,23,41,-10,-37,-15,-19,46,-39],"k":12,"x":5}' },
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
