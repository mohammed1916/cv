import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Set', description: 'Put every number in a hash set.' },
    { id: 'check', label: 'Check negative', description: 'Look up the negative of a positive number.' },
    { id: 'match', label: 'Pair found', description: 'Both k and -k are present; keep the larger k.' },
    { id: 'skip', label: 'Skip', description: 'Negative numbers are not candidates.' },
    { id: 'done', label: 'Answer', description: 'Report the largest qualifying k, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Distinct nonzero integers as JSON: {"nums": [...]}',
  url: 'https://leetcode.com/problems/largest-positive-integer-that-exists-with-its-negative/',
  complexity: 'O(n) time and O(n) space for the set. The visualization caps input at 30 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[-1,2,-3,3]}' },
    { label: 'Example 2', input: '{"nums":[-1,10,6,7,-7,1]}' },
    { label: 'Example 3', input: '{"nums":[-10,8,6,7,-2,-3]}' },
  ],
}

export default function PositiveWithNegative() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index ?? -1} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Best so far">{`Largest k so far: ${step.result === -1 ? 'none' : step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>The set turns “is -k present?” into a single lookup, so each positive number is checked without scanning the list.</p>
    <p>Only positive numbers are candidates, and the answer is the largest of them that has a partner.</p>
  </>} />
}
