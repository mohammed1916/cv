import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Dominant', description: 'Find the value that appears more than half the time.' },
    { id: 'scan', label: 'Scan splits', description: 'Move the split right and track the dominant count on the left.' },
    { id: 'found', label: 'Valid split', description: 'Both sides keep a majority of the dominant value.' },
    { id: 'done', label: 'Complete', description: 'No valid split exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array nums with a dominant value (JSON object)',
  url: 'https://leetcode.com/problems/minimum-index-of-a-valid-split/',
  complexity: 'O(n) time and O(n) space for the value counts. The visualization caps the array at 30 values.',
  examples: [
    { label: 'Split at 2', input: '{"nums":[1,2,2,2]}' },
    { label: 'Split at 4', input: '{"nums":[2,1,3,1,1,1,7,1,2,1]}' },
  ],
}

export default function ValidSplit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const split = step.index
    return <>
      <IndexedSequence label="Array" length={nums.length} valueAt={i => nums[i]} active={split}
        roleAt={i => (split < 0 ? '' : i <= split ? 'left' : 'right')} />
      <output aria-label="Current step">{`Dominant value ${step.dominant}. ${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A valid split must leave the dominant value as a majority on both sides, and the whole array has only one such candidate.</p>
    <p>Moving the split one step right updates the left count in constant time, so one pass finds the smallest valid index.</p>
  </>} />
}
