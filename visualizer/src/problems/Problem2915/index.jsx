import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Only sum 0 is reachable, with length 0.' },
    { id: 'item', label: 'Next number', description: 'Consider the next number, used at most once.' },
    { id: 'cell', label: 'Update sum', description: 'Extend the best length for this sum from a smaller sum.' },
    { id: 'done', label: 'Complete', description: 'Report the longest length for the target sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Input (JSON object with nums and target)',
  url: 'https://leetcode.com/problems/length-of-the-longest-subsequence-that-sums-to-target/',
  complexity: 'O(n * target) time and O(target) space. The visualization caps nums at 12 entries and target at 30.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4,5],"target":9}' },
    { label: 'Example 2', input: '{"nums":[4,1,3,2,1,5],"target":7}' },
    { label: 'Impossible', input: '{"nums":[1,1,5,4,5],"target":3}' },
  ],
}

export default function LongestSubsequenceSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable
      title="best[s]: longest length reaching sum s"
      values={[step.best.map(v => (v === null ? '–' : v))]}
      rowLabels={['best']}
      activeCell={step.cell === null ? null : { row: 0, column: step.cell }}
    />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Scanning sums from high to low means a number updates best[s] only from values computed before this number was considered, so it is never used twice.</p>
    <p>Each sum keeps only the longest subsequence found so far, because a longer one with the same sum is always at least as good.</p>
  </>} />
}
