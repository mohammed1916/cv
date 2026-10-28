import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty total', description: 'No special subsequence is counted yet.' },
    { id: 'pair', label: 'Middle pair', description: 'Count matching outer pairs for this middle pair.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of special subsequences.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from 1 to 9, length 1 to 14 (JSON)',
  url: 'https://leetcode.com/problems/count-special-subsequences/',
  complexity: 'O(n^3) time with map lookups, and O(n) extra space per middle pair. The visualization caps input at 14 numbers.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,4,3,6,1]' },
    { label: 'Example 2', input: '[3,4,3,4,3,4,3,4]' },
  ],
}

export default function SpecialSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.length} valueAt={index => run.input[index]} active={step.r ?? step.q ?? -1} roleAt={index => (index === step.q ? 'q' : index === step.r ? 'r' : '')} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The condition nums[p] * nums[r] = nums[q] * nums[s] is the same as nums[p] / nums[q] = nums[s] / nums[r].</p>
    <p>Each middle pair (q, r) only needs the counts of each reduced ratio on its left and on its right.</p>
  </>} />
}
