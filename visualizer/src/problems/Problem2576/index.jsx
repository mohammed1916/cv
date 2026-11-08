import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the values from smallest to largest.' },
    { id: 'pair', label: 'Mark pair', description: 'A small value doubled fits under the current large value.' },
    { id: 'skip', label: 'Skip', description: 'The large value is too small for the next small value.' },
    { id: 'done', label: 'Complete', description: 'Report twice the number of pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums array (JSON)',
  url: 'https://leetcode.com/problems/find-the-maximum-number-of-marked-indices/',
  complexity: 'O(n log n) time for sorting, O(n) for the scan. The visualization caps input at 20 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,5,2,4]}' },
    { label: 'Example 2', input: '{"nums":[9,2,5,4]}' },
    { label: 'Single value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[5,5,5,5]}' },
    { label: 'Twenty values, extremes', input: '{"nums":[100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1]}' },
    { label: 'Long run: twenty values', input: '{"nums":[26,12,6,96,65,71,34,48,49,78,92,82,60,63,71,96,47,36,85,32]}' },
  ],
}

export default function MarkedIndices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted values" length={step.sorted.length} valueAt={i => step.sorted[i]} active={step.j}
      roleAt={i => (i < step.count ? 'small' : i === step.j ? 'large' : '')} />
    <output aria-label="Pairs">{`Pairs found: ${step.count}. Marked indices: ${2 * step.count} of ${run.input.nums.length}.`}</output>
  </>} renderReasoning={() => <>
    <p>After sorting, the smallest values are the best candidates to be doubled, and the largest are the best partners.</p>
    <p>A greedy scan of the upper half matches each partner with the smallest unused value that it can cover.</p>
  </>} />
}
