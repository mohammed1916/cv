import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Unknown size', description: 'The reader only answers for an index.' },
    { id: 'expand', label: 'Double the probe', description: 'Find an index whose value is at least the target.' },
    { id: 'search', label: 'Binary search', description: 'Halve the range that the probes bound.' },
    { id: 'done', label: 'Complete', description: 'Report the index, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Sorted array and target (JSON)',
  url: 'https://leetcode.com/problems/search-in-a-sorted-array-of-unknown-size/',
  complexity: 'O(log n) reads. The visualization caps the array at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"arr":[-1,0,3,5,9,12],"target":9}' },
    { label: 'Missing', input: '{"arr":[-1,0,3,5,9,12],"target":2}' },
  ],
}

export default function SearchUnknownSize() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const shown = Math.max(...step.reads, run.arr.length - 1) + 1
    return <>
      <IndexedSequence label="Reader (indices probed so far)" length={shown} active={step.probe ?? -1}
        valueAt={i => (i < run.arr.length ? run.arr[i] : '∞')}
        roleAt={i => (step.reads.includes(i) ? 'read' : '')} />
      <output aria-label="Bounds">{`Search range [${step.left}, ${step.right}]`}{step.result !== null && step.result !== -1 ? `, found at ${step.result}` : ''}</output>
    </>
  }} renderReasoning={() => <>
    <p>Without the size, the search first finds an index past the target by doubling. The reader returns a huge value past the end, so that index always passes.</p>
    <p>The target must lie between the last probe below it and the first probe at or above it. A binary search over that range finishes in logarithmic reads.</p>
  </>} />
}
