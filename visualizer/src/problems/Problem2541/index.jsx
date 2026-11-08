import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Differences', description: 'Subtract nums2 from nums1 at every index.' },
    { id: 'diff', label: 'Steps', description: 'Turn each difference into a count of k-sized steps.' },
    { id: 'check', label: 'Balance', description: 'Test divisibility and that increases cancel decreases.' },
    { id: 'done', label: 'Complete', description: 'Report the number of increase steps.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums1, nums2 (equal length) and k',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-equal-ii/',
  complexity: 'O(n) time and O(n) space. The visualization caps the arrays at ten entries.',
  examples: [
    { label: 'Own case 1', input: '{"nums1":[5,4,2,5],"nums2":[2,4,8,2],"k":4}' },
    { label: 'Own case 2', input: '{"nums1":[4,9,6,3],"nums2":[3,5,2,7],"k":2}' },
    { label: 'Single pair', input: '{"nums1":[1],"nums2":[30],"k":1}' },
    { label: 'Equal values', input: '{"nums1":[2,2],"nums2":[2,2],"k":2}' },
    { label: 'Alternating extremes, five picks', input: '{"nums1":[30,1,30,1,30,1,30,1,30,1],"nums2":[1,30,1,30,1,30,1,30,1,30],"k":5}' },
    { label: 'Long run: ten pairs, five picks', input: '{"nums1":[5,29,3,30,15,26,20,16,4,8],"nums2":[2,18,10,4,25,5,2,25,6,12],"k":5}' },
  ],
}

export default function MinimumOperationsEqualII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Differences nums1 minus nums2" length={run.diffs.length} valueAt={index => run.diffs[index]} active={step.index} />
    <output aria-label="Totals">{`Net steps: ${step.total}, increase steps: ${step.moves}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation moves k units from one entry to another, so every difference must be a multiple of k.</p>
    <p>The increases and decreases must cancel. Each unit of increase is paired with one unit of decrease, so the count of increases is the answer.</p>
  </>} />
}
