import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Search the whole mountain for its peak.' },
    { id: 'peak', label: 'Find peak', description: 'Move toward the side that still rises.' },
    { id: 'ascending', label: 'Ascending', description: 'Binary search the rising part for the target.' },
    { id: 'descending', label: 'Descending', description: 'Binary search the falling part for the target.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest matching index or minus one.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with mountain array and target (JSON)',
  url: 'https://leetcode.com/problems/find-in-mountain-array/',
  complexity: 'O(log n) time and O(1) extra space. The mountain is read through index access only.',
  examples: [
    { label: 'Example 1', input: '{"mountain":[1,2,3,4,5,3,1],"target":3}' },
    { label: 'Absent', input: '{"mountain":[0,1,2,4,2,1],"target":3}' },
  ],
}

export default function MountainSearch() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const inRange = index => step.lo >= 0 && index >= step.lo && index <= step.hi
    return <>
      <IndexedSequence label="Mountain" length={run.input.mountain.length} active={step.mid}
        valueAt={index => run.input.mountain[index]}
        roleAt={index => (index === step.peak ? 'peak' : inRange(index) ? 'range' : '')} />
      <output aria-label="Search state">{step.found >= 0 ? `Found at index ${step.found}` : `Range ${step.lo}..${step.hi}${step.peak >= 0 ? `, peak ${step.peak}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A mountain array is strictly increasing to one peak and then strictly decreasing, so the peak is found by binary search on the slope.</p>
    <p>Each side is monotone, so each can be binary searched. Checking the rising side first returns the smaller index.</p>
  </>} />
}
