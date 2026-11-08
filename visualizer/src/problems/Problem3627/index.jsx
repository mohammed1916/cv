import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort a copy from smallest to largest.' },
    { id: 'group', label: 'Group', description: 'Take the top pair of the remaining values and count its lower member as the median.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum sum of medians.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 3, 6, 9 or 12 integers from 1 to 30, for example [2,1,3,2,1,3]',
  url: 'https://leetcode.com/problems/maximum-median-sum-of-subsequences-of-size-3/',
  complexity: 'O(n log n) time for the sort. The visualization caps the array at 12 numbers.',
  examples: [
    { label: 'Own case 1', input: '[3,2,4,3,2,4]' },
    { label: 'Example 2', input: '[1,2,3]' },
    { label: 'Smallest length, equal values', input: '[1,1,1]' },
    { label: 'Nine equal values', input: '[7,7,7,7,7,7,7,7,7]' },
    { label: 'Largest values in twelve', input: '[30,1,30,1,30,1,30,1,30,1,30,1]' },
    { label: 'Long run: 12 values', input: '[6,20,8,5,21,10,15,18,15,8,2,9]' },
  ],
}

export default function MaxMedianSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted numbers" length={run.sorted.length} valueAt={index => run.sorted[index]} active={step.index}
      roleAt={index => (step.chosen.includes(index) ? 'median' : '')} />
    <output aria-label="Median sum">{`Median sum so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>The largest values are most useful as the top of a triple, so each group pairs the largest remaining value with the value just below it.</p>
    <p>The median of that group is the lower of the pair, and the smallest leftover values fill the rest of each triple.</p>
  </>} />
}
