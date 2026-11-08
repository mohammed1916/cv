import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Unknown size', description: 'The reader only answers for an index.' },
    { id: 'expand', label: 'Double the probe', description: 'Find an index whose value is at least the target.' },
    { id: 'search', label: 'Binary search', description: 'Halve the range that the probes bound.' },
    { id: 'done', label: 'Complete', description: 'Report the index, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sorted array and target (JSON)',
  url: 'https://leetcode.com/problems/search-in-a-sorted-array-of-unknown-size/',
  complexity: 'O(log n) reads. The visualization caps the array at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"arr":[-1,0,3,5,9,12],"target":9}' },
    { label: 'Missing', input: '{"arr":[-1,0,3,5,9,12],"target":2}' },
    { label: 'Single value found', input: '{"arr":[7],"target":7}' },
    { label: 'Single value missing', input: '{"arr":[7],"target":3}' },
    { label: 'Extreme values', input: '{"arr":[-1000,1000],"target":-1000}' },
    { label: 'Long run: 30 values', input: '{"arr":[-878,-802,-671,-556,-513,-416,-376,-259,-166,-149,-49,-31,-27,16,30,174,252,295,307,336,422,427,559,808,822,864,906,940,965,981],"target":422}' },
  ],
}

export default function SearchUnknownSize() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const shown = Math.max(...step.reads, run.arr.length - 1) + 1
    return <>
      <IndexedSequence label="Reader (indices probed so far)" length={shown} active={step.probe ?? -1}
        valueAt={i => (i < run.arr.length ? run.arr[i] : '∞')}
        roleAt={i => (i === step.left ? 'lo' : i === step.right ? 'hi' : step.reads.includes(i) ? 'read' : '')} />
      <AnswerRangeBar title="Index search range" min={0} max={Math.max(shown - 1, step.right)} low={step.left} high={step.right} />
      <output aria-label="Bounds">{`Search range [${step.left}, ${step.right}]`}{step.result !== null && step.result !== -1 ? `, found at ${step.result}` : ''}</output>
    </>
  }} renderReasoning={() => <>
    <p>Without the size, the search first finds an index past the target by doubling. The reader returns a huge value past the end, so that index always passes.</p>
    <p>The target must lie between the last probe below it and the first probe at or above it. A binary search over that range finishes in logarithmic reads.</p>
  </>} />
}
