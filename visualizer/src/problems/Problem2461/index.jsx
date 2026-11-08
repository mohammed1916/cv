import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2461',
  phases: [
    { id: 'slide', label: 'Slide', description: 'Move the window of length k one step to the right.' },
    { id: 'done', label: 'Result', description: 'Return the best sum of a window with k distinct values.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1, 5, 4, 2, 9, 9, 9], "k": 3}',
  url: 'https://leetcode.com/problems/maximum-sum-of-distinct-subarrays-with-length-k/',
  complexity: 'O(n) time and O(k) extra space for the window counts.',
  examples: [
    { label: 'Example', input: '{"nums":[1,5,4,2,9,9,9],"k":3}' },
    { label: 'Repeats', input: '{"nums":[4,4,4],"k":3}' },
    { label: 'Single value', input: '{"nums":[9],"k":1}' },
    { label: 'Equal values', input: '{"nums":[5,5,5,5],"k":4}' },
    { label: 'Largest values', input: '{"nums":[9,1,9,1,9,1,9,1,9,1,9,1],"k":6}' },
    { label: 'Long run: 12 values', input: '{"nums":[9,3,8,6,2,2,2,8,1,6,9,5],"k":1}' },
  ],
}

export default function MaxSumDistinctWindow() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.r}
        roleAt={i => (step.l >= 0 && i === step.l ? 'l' : i === step.r ? 'r' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
      <output aria-label="Window">{step.l >= 0 ? `sum ${step.sum}, distinct ${step.distinct} of ${run.input.k}` : `best ${step.best}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Only windows of exactly length k are candidates. Slide one window across the array, keeping a count of each value so that repeats are visible.</p>
    <p>A window counts only when its number of distinct values is exactly k, which is the same as having no repeats. Keep the best sum among those windows.</p>
  </>} />
}
