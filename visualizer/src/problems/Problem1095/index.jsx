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
    { label: 'Smallest mountain', input: '{"mountain":[1,2,1],"target":2}' },
    { label: 'Target on both slopes uses the smaller index', input: '{"mountain":[1,2,3,2,1],"target":2}' },
    { label: 'Largest peak, zero on both flanks', input: '{"mountain":[0,100,0],"target":0}' },
    { label: 'Long run: 40 values', input: '{"mountain":[1,2,3,4,5,7,10,12,16,17,18,20,22,26,28,35,38,42,43,45,49,100,98,95,93,92,89,88,84,83,81,80,76,74,73,70,58,57,56,55],"target":7}' },
  ],
}

export default function MountainSearch() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const inRange = index => step.lo >= 0 && index >= step.lo && index <= step.hi
    return <>
      <IndexedSequence label="Mountain (l and r bound the current binary search)" length={run.input.mountain.length} active={step.mid}
        valueAt={index => run.input.mountain[index]}
        roleAt={index => (index === step.lo ? 'l' : index === step.hi ? 'r' : index === step.peak ? 'peak' : inRange(index) ? 'range' : '')} />
      <output aria-label="Search state">{step.found >= 0 ? `Found at index ${step.found}` : `Range ${step.lo}..${step.hi}${step.peak >= 0 ? `, peak ${step.peak}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A mountain array is strictly increasing to one peak and then strictly decreasing, so the peak is found by binary search on the slope.</p>
    <p>Each side is monotone, so each can be binary searched. Checking the rising side first returns the smaller index.</p>
  </>} />
}
