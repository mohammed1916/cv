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
    { label: 'Example 1', input: '{"nums1":[4,3,1,4],"nums2":[1,3,7,1],"k":3}' },
    { label: 'Example 2', input: '{"nums1":[3,8,5,2],"nums2":[2,4,1,6],"k":1}' },
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
