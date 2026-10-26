import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Search range', description: 'Window starts range from 0 to n − k.' },
    { id: 'compare', label: 'Compare ends', description: 'Drop the start if its far end is worse.' },
    { id: 'done', label: 'Complete', description: 'Return the window.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Input (JSON object with arr, k and x)',
  url: 'https://leetcode.com/problems/find-k-closest-elements/',
  complexity: 'O(log(n − k) + k) time and O(1) extra space beyond the output.',
  examples: [
    { label: 'Near middle', input: '{"arr":[1,2,3,4,5],"k":4,"x":3}' },
    { label: 'Far left', input: '{"arr":[1,1,2,3,4,5],"k":4,"x":-1}' },
    { label: 'Tie', input: '{"arr":[1,3],"k":1,"x":2}' },
  ],
}

export default function FindKClosest() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted array (window shaded)" length={run.input.arr.length} active={step.mid ?? step.left ?? -1}
      valueAt={i => run.input.arr[i]}
      roleAt={i => (i >= step.lo && i < step.lo + run.input.k ? 'in-window' : '')} />
    <output aria-label="Search range">Start index between {step.lo} and {step.hi}{step.mid !== null && step.mid !== undefined ? ` · mid ${step.mid}` : ''}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Monotone test:</strong> the difference between the window's two ends and x decides which way to move, because the closer window must start no later than mid.</p>
    <p>Target x = {run.input.x}, window size {run.input.k}.</p>
  </>} />
}
