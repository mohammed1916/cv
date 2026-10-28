import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'No integer has been counted yet.' },
    { id: 'add', label: 'Add', description: 'Add each number and its reversal to the set.' },
    { id: 'done', label: 'Count', description: 'Report the size of the set.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers as JSON: {"nums": [...]}',
  url: 'https://leetcode.com/problems/count-number-of-distinct-integers-after-reverse-operations/',
  complexity: 'O(n * d) time for n numbers of d digits, and O(n) space. The visualization caps input at 30 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,13,10,12,31]}' },
    { label: 'Example 2', input: '{"nums":[2,2,2]}' },
  ],
}

export default function DistinctAfterReverse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index ?? -1} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Distinct so far">{`Distinct integers so far: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Every number contributes two integers: itself and its digits reversed. The set removes repeats, including reversals that match other numbers.</p>
    <p>Reversing a number drops leading zeros automatically, so 10 becomes 1.</p>
  </>} />
}
