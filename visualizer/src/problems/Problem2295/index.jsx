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
    { label: 'Own case 1', input: '{"nums":[2,3,5,7],"operations":[[2,4],[5,8],[7,2]]}' },
    { label: 'Own case 2', input: '{"nums":[2,3],"operations":[[2,4],[3,2],[4,3]]}' },
    { label: 'Single number moved', input: '{"nums":[5],"operations":[[5,6]]}' },
    { label: 'Replace with an unused value', input: '{"nums":[3,8],"operations":[[3,4]]}' },
    { label: 'Largest lists, ten replacements', input: '{"nums":[1,10,20,30,40,50,60,70,80,90,100,5],"operations":[[1,2],[2,3],[10,11],[20,21],[30,31],[40,41],[50,51],[60,61],[70,71],[80,81]]}' },
    { label: 'Long run: 12 numbers', input: '{"nums":[12,47,3,88,25,60,9,71,33,50,14,96],"operations":[[12,13],[47,48],[3,4],[88,89],[25,26],[60,61],[9,10],[71,72],[33,34],[50,51]]}' },
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
