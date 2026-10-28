import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Sort a copy of the values.' },
    { id: 'beat', label: 'Beat', description: 'The candidate beats the smallest unbeaten value.' },
    { id: 'skip', label: 'Skip', description: 'The candidate cannot beat the smallest unbeaten value.' },
    { id: 'done', label: 'Complete', description: 'Report the greatness.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 1 to 12 integers from 0 to 99 (JSON)',
  url: 'https://leetcode.com/problems/maximize-greatness-of-an-array/',
  complexity: 'O(n log n) for the sort and one linear scan. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '[1,3,5,2,1,3,1]' },
    { label: 'Example 2', input: '[1,2,3,4]' },
  ],
}

export default function MaximizeGreatness() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted values" length={step.base.length} valueAt={i => step.base[i]}
      active={step.index} roleAt={i => (i === step.beaten ? 'smallest unbeaten' : '')} />
    <output aria-label="Greatness so far">{`Beaten so far: ${step.beaten}`}</output>
  </>} renderReasoning={() => <>
    <p>After sorting, only the smallest value that is still unbeaten matters for each candidate.</p>
    <p>A candidate that beats it is matched and the pointer advances; otherwise the candidate is skipped.</p>
  </>} />
}
