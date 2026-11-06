import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3865View from './Problem3865View'
import { buildTrace, parseInput, code, python } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Work out the block size and copy the array.' },
    { id: 'block', label: 'Block', description: 'Choose the next block.' },
    { id: 'compare', label: 'Pair', description: 'Pick the outer pair of the block.' },
    { id: 'swap', label: 'Swap', description: 'Exchange the pair.' },
    { id: 'blockDone', label: 'Block done', description: 'This block is reversed.' },
    { id: 'done', label: 'Result', description: 'Return the rearranged array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (k must divide the length)',
  url: 'https://leetcode.com/problems/reverse-k-subarrays/',
  complexity: 'O(n) time and O(n) space for the result copy. Each element moves at most once. The visualization caps the array at 16 values.',
  examples: [
    { label: 'Two blocks', input: '{"nums":[1,2,3,4,5,6,7,8],"k":2}' },
    { label: 'Three blocks', input: '{"nums":[5,-1,0,3,9,9],"k":3}' },
  ],
}

export default function Problem3865Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <><IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => i === step.lo ? 'l' : i === step.hi ? 'r' : ''} /><Problem3865View run={run} step={step} /></>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Blocks never overlap, so each block is reversed on its own with two indices walking inward.</p>
  </>} />
}
