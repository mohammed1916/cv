import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Occupied set', description: 'Start with the positions that hold marbles.' },
    { id: 'move', label: 'Move', description: 'Remove the source position and add the destination.' },
    { id: 'done', label: 'Sorted result', description: 'Return the occupied positions in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Positions and moves as JSON: {"nums": [...], "moveFrom": [...], "moveTo": [...]}',
  url: 'https://leetcode.com/problems/relocate-marbles/',
  complexity: 'O(n + m) time for m moves with a hash set, plus O(k log k) to sort the k occupied positions. The visualization caps input at 10 marbles and 10 moves.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,6,7,8],"moveFrom":[1,7,2],"moveTo":[2,9,5]}' },
    { label: 'Example 2', input: '{"nums":[1,1,3,3],"moveFrom":[1,3],"moveTo":[2,2]}' },
  ],
}

export default function RelocateMarbles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Occupied positions">{step.result ? `Occupied: ${step.result.join(', ')}` : 'Positions are still moving'}</output>
  </>} renderReasoning={() => <>
    <p>Every marble on a source position moves together, so the set only needs to hold distinct occupied positions.</p>
    <p>A move removes its source from the set and adds its destination; if the destination was already occupied, the two stacks merge into one entry.</p>
  </>} />
}
