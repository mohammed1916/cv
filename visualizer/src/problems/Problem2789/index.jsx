import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Last value', description: 'Start with the last value as the current block.' },
    { id: 'scan', label: 'Scan left', description: 'Merge a value into the block on its right, or start a new block.' },
    { id: 'done', label: 'Complete', description: 'Report the largest block value seen.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with an integer array nums (values 1 to 1000)',
  url: 'https://leetcode.com/problems/largest-element-in-an-array-after-merge-operations/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at twenty values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,7,9,3]}' },
    { label: 'Example 2', input: '{"nums":[5,3,3]}' },
  ],
}

export default function LargestAfterMerge() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} roleAt={index => (step.index >= 0 && index > step.index && step.merged ? 'merged' : '')} />
    <output aria-label="Block">{`Current block: ${step.current}, best: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A value can merge into its right neighbour only when it is no larger, and merging only grows the right side.</p>
    <p>Scanning from the right tracks the largest block that can be built ending at each position, and the answer is the largest block seen.</p>
  </>} />
}
