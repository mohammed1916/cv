import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'extend', label: 'Extend', description: 'Add the next element to the valid window.' },
    { id: 'shrink', label: 'Shrink', description: 'Drop the left element while the new value would complete a triple.' },
    { id: 'done', label: 'Complete', description: 'Report the longest valid subarray.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums)',
  url: 'https://www.talentd.in/fleetcode/problems/longest-subarray-with-restricted-pair-sums',
  complexity: 'O(n · w) time for window width w, and O(w) space. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,5,3,2,1]}' },
    { label: 'Example 2', input: '{"nums":[3,4,5,6]}' },
  ],
}

export default function RestrictedPairSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right}
      roleAt={i => (i >= step.left && i <= step.right ? 'window' : '')} />
    <output aria-label="Best">{`Window [${step.left}..${step.right}], best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A window is valid when no three distinct positions have nums[i] + nums[j] = nums[k]. Making a window longer never removes a conflict, so the window only moves forward.</p>
    <p>Each new element is checked against the window: it may be the sum, or one addend whose partner is already present.</p>
  </>} />
}
