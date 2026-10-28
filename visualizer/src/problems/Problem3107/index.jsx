import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort a copy and locate the median position.' },
    { id: 'match', label: 'Match', description: 'The median already equals k.' },
    { id: 'raise', label: 'Raise', description: 'The median is too small, so raise the numbers from the median onward.' },
    { id: 'lower', label: 'Lower', description: 'The median is too large, so lower the numbers up to the median.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of changes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 40 integers from 1 to 60) and k, for example {"nums":[2,5,6,8,5],"k":4}',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-median-of-array-equal-to-k/',
  complexity: 'O(n log n) time for the sort. The visualization caps the array at 40 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,5,6,8,5],"k":4}' },
    { label: 'Example 2', input: '{"nums":[2,5,6,8,5],"k":7}' },
  ],
}

export default function MedianToK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted numbers" length={run.sorted.length} valueAt={index => run.sorted[index]} active={step.index}
      roleAt={index => (index === run.mid ? 'median' : '')} />
    <output aria-label="Cost">{`Target k = ${run.input.k}. Operations so far: ${step.cost}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the median position decides the median, so the other numbers only matter as they relate to it.</p>
    <p>If the median is too small, every number from the median onward must reach k, and the ones already above k are free. The mirror case works from the start to the median.</p>
  </>} />
}
