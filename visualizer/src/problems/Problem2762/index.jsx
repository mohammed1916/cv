import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Empty window and deques.' },
    { id: 'extend', label: 'Extend', description: 'Add the right end and shrink until the window is continuous.' },
    { id: 'done', label: 'Complete', description: 'Report the total count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers as JSON array (1 to 10, up to 12 values)',
  url: 'https://leetcode.com/problems/continuous-subarrays/',
  complexity: 'O(n) time with two monotonic deques, O(n) space.',
  examples: [
    { label: 'Example 1', input: '[5,4,2,4]' },
    { label: 'Ascending', input: '[1,2,3]' },
  ],
}

export default function ContinuousSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { left } = step
    return <>
      <IndexedSequence label="nums (window marked)" length={run.input.length} active={step.right ?? -1}
        valueAt={i => run.input[i]} roleAt={i => (step.right !== null && i >= left && i <= step.right ? 'window' : '')} />
      <output aria-label="Deques">{`Max queue [${step.maxQ.join(', ')}], min queue [${step.minQ.join(', ')}]`}</output>
      <p>{`Total continuous subarrays: ${step.total}`}</p>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>The largest and smallest values of a window are the fronts of two monotonic deques, so the test costs O(1) per check.</p>
    <p>Every window ending at the current index that starts at or after left is continuous, which adds right minus left plus 1 subarrays.</p>
  </>} />
}
