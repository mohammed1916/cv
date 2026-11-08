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
    { label: 'Three values', input: '{"nums":[2,3,5,4],"target":10}' },
    { label: 'Repeats help', input: '{"nums":[1,3,3,1,2],"target":5}' },
    { label: 'Impossible', input: '{"nums":[6,6,2],"target":4}' },
    { label: 'Single value', input: '{"nums":[4],"target":4}' },
    { label: 'Single value too large', input: '{"nums":[7],"target":4}' },
    { label: 'Equal values share a sum', input: '{"nums":[2,2,2,2],"target":6}' },
    { label: 'Largest values at the target', input: '{"nums":[30,30,1],"target":30}' },
    { label: 'Long run: 12 items', input: '{"nums":[27,26,20,12,30,6,28,23,8,16,15,22],"target":25}' },
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
