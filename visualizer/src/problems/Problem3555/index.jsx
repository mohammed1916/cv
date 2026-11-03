import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SlidingSortView from './SlidingSortView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Slide', description: 'Start the window at the left edge.' },
    { id: 'window', label: 'Compare', description: 'Sort a copy of the window.' },
    { id: 'left', label: 'Left edge', description: 'Find the first mismatch.' },
    { id: 'right', label: 'Right edge', description: 'Find the last mismatch.' },
    { id: 'record', label: 'Record', description: 'Store the segment length.' },
    { id: 'done', label: 'Result', description: 'Report every window answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers) and k (window length)',
  url: 'https://leetcode.com/problems/smallest-subarray-to-sort-in-every-sliding-window/',
  complexity: 'O(n * k log k) time for this direct version, which sorts each window copy. The visualization caps nums at 12 values.',
  examples: [
    { label: 'Mixed window', input: '{"nums":[1,3,2,4,5],"k":3}' },
    { label: 'Reversed run', input: '{"nums":[3,2,1,6],"k":3}' },
  ],
}

export default function SmallestSubarrayToSortInEverySlidingWindow() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <SlidingSortView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>A window is repaired exactly by sorting the span between its first and last mismatch with the sorted copy.</p>
    </>} />
}
