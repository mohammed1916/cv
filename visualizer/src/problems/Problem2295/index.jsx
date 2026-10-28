import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Positions', description: 'Map each starting value to its index.' },
    { id: 'replace', label: 'Replace', description: 'Find the old value’s slot, overwrite it, and move its table entry.' },
    { id: 'done', label: 'Final array', description: 'Return the array after every replacement.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array and operations as JSON: {"nums": [...], "operations": [[old, new], ...]}',
  url: 'https://leetcode.com/problems/replace-elements-in-an-array/',
  complexity: 'O(n + m) time for m operations, with O(n) space for the position table. The visualization caps input at 12 numbers and 10 operations.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,4,6],"operations":[[1,3],[4,7],[6,1]]}' },
    { label: 'Example 2', input: '{"nums":[1,2],"operations":[[1,3],[2,1],[3,2]]}' },
  ],
}

export default function ReplaceElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Array" length={step.nums.length} valueAt={i => step.nums[i]} active={step.index} />
    <HashMapView maps={step.maps} ops={step.ops} />
  </>} renderReasoning={() => <>
    <p>The position table turns “find where this value is” into one lookup, so each operation avoids scanning the array.</p>
    <p>Each replacement moves one table entry: the old value leaves, and the new value takes over the same index.</p>
  </>} />
}
