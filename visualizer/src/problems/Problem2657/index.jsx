import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty sets', description: 'Nothing from either array has been seen.' },
    { id: 'a', label: 'Read A[i]', description: 'Add A[i] to its set and check the B set.' },
    { id: 'b', label: 'Read B[i]', description: 'Add B[i] to its set and check the A set.' },
    { id: 'record', label: 'Record', description: 'Store the common count for this prefix.' },
    { id: 'done', label: 'Complete', description: 'Every prefix has been counted.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two permutations as JSON: {"A": [...], "B": [...]}',
  url: 'https://leetcode.com/problems/find-the-prefix-common-array-of-two-arrays/',
  complexity: 'O(n) time and O(n) space with two sets. The visualization caps input at 20 numbers.',
  examples: [
    { label: 'Example 1', input: '{"A":[1,3,2,4],"B":[3,1,2,4]}' },
    { label: 'Example 2', input: '{"A":[2,3,1],"B":[3,1,2]}' },
  ],
}

export default function PrefixCommonArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="A" length={run.input.A.length} valueAt={i => run.input.A[i]} active={step.index ?? -1} />
    <IndexedSequence label="B" length={run.input.B.length} valueAt={i => run.input.B[i]} active={step.index ?? -1} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Prefix common array so far">{`Result so far: [${step.result.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Each prefix count is the previous count plus the values that became common at this index. Each new value is checked against the other set once.</p>
    <p>Checking both orders at each index means a value that appears in both prefixes is counted exactly once, even when it sits at the same index in both arrays.</p>
  </>} />
}
