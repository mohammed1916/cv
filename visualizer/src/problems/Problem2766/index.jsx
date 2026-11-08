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
    { label: 'Own case 1', input: '{"nums":[2,7,8,9],"moveFrom":[2,8,3],"moveTo":[3,10,6]}' },
    { label: 'Own case 2', input: '{"nums":[2,2,4,4],"moveFrom":[2,4],"moveTo":[3,3]}' },
    { label: 'Single marble, no moves', input: '{"nums":[5],"moveFrom":[],"moveTo":[]}' },
    { label: 'Move to the same spot', input: '{"nums":[3],"moveFrom":[3],"moveTo":[3]}' },
    { label: 'Boundary: marbles at 1 and 20', input: '{"nums":[1,20],"moveFrom":[1],"moveTo":[20]}' },
    { label: 'Long run: 10 marbles, 10 moves', input: '{"nums":[8,19,2,15,7,13,4,17,16,14],"moveFrom":[2,14,11,1,8,17,10,4,12,13],"moveTo":[1,11,9,10,2,18,12,3,20,17]}' },
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
