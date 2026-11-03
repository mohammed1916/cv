import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Arrangement (JSON object with arr)',
  url: 'https://leetcode.com/problems/previous-permutation-with-one-swap/',
  complexity: 'O(n) time and O(n) space for the copy used by the trace. The visualization caps input at 40 values.',
  examples: [
    { label: 'Late descent', input: '{"arr":[7,4,9,6,8,5,3,3,4]}' },
    { label: 'Leftmost duplicate', input: '{"arr":[8,3,3,6,6]}' },
    { label: 'Smallest already', input: '{"arr":[1,2,2,4,7]}' },
    { label: 'Single value', input: '{"arr":[9]}' },
  ],
}

export default function PreviousPermutationWithOneSwap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr, i, j, k, swapped } = step.snapshot
    const role = idx => {
      if (swapped && (idx === swapped[0] || idx === swapped[1])) return 'swapped'
      if (idx === i) return 'pivot'
      if (idx === k && k >= 0) return 'partner'
      if (idx === j && j >= 0) return 'candidate'
      return ''
    }
    return <>
      <IndexedSequence label="Arrangement" length={arr.length} valueAt={idx => arr[idx]} active={i >= 0 ? i : 0} roleAt={role} />
      <p>{swapped ? `Swapped positions ${swapped[0]} and ${swapped[1]}.` : i >= 0 ? `Pivot at position ${i}.` : 'No pivot yet.'}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Changing the rightmost possible position keeps the longest possible prefix. Among values smaller than the pivot, the largest one gives the greatest result, and its leftmost copy keeps the suffix as large as possible.</p>
  </>} />
}
