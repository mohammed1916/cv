import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, phases, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON array of integers)',
  complexity: 'O(n log n) time for the sort and O(n) extra space. The visualization caps input at 12 values.',
  examples: [
    { label: 'Sample', input: '[8,1,2,2,3]' },
    { label: 'Mixed', input: '[6,5,4,8]' },
    { label: 'All equal', input: '[7,7,7,7]' },
  ],
}

export default function SmallerThanCurrent() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const { nums, ordered, answer, index, value, pointer } = step.snapshot
      return <>
        <IndexedSequence label="Original order" length={nums.length} valueAt={i => nums[i]} active={index ?? -1}
          roleAt={i => (i < answer.length ? 'counted' : '')} />
        <IndexedSequence label="Sorted copy" length={ordered.length} valueAt={i => ordered[i]} active={pointer ?? -1}
          roleAt={i => (value !== undefined && ordered[i] < value ? 'smaller' : '')} />
        <p>Answer so far: {answer.join(', ') || 'none yet'}</p>
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
