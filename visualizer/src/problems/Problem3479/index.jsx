import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SegtreeView from '../../components/shared/SegtreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Baskets', description: 'Capacities stored in a max segment tree.' },
    { id: 'fruit', label: 'Place fruit', description: 'Descend to the leftmost basket that fits, then empty it.' },
    { id: 'done', label: 'Complete', description: 'Report the unplaced fruits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"fruits": [...], "baskets": [...]} (1 to 10 each)',
  url: 'https://leetcode.com/problems/fruits-into-baskets-iii/',
  complexity: 'O(n log m) time with a segment tree over the baskets; the visualization caps both lists at 12 values.',
  examples: [
    { label: 'Own case 1', input: '{"fruits":[5,3,6],"baskets":[4,6,5]}' },
    { label: 'Own case 2', input: '{"fruits":[4,7,2],"baskets":[7,5,8]}' },
    { label: 'Single fruit and basket', input: '{"fruits":[7],"baskets":[9]}' },
    { label: 'Equal values', input: '{"fruits":[4,4,4],"baskets":[4,4,4]}' },
    { label: 'Largest values', input: '{"fruits":[10,1,10],"baskets":[1,10,1]}' },
    { label: 'All ones', input: '{"fruits":[1,1],"baskets":[1,1]}' },
    { label: 'Long run: 12 items', input: '{"fruits":[2,1,4,10,8,3,9,2,6,2,1,1],"baskets":[3,9,5,10,4,2,8,3,8,5,10,10]}' },
  ],
}

export default function FruitsIntoBasketsIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <SegtreeView {...step.seg} />
    <output aria-label="Unplaced">{`Unplaced so far: ${step.unplaced}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The largest capacity over a range decides whether any basket in it fits; the leftmost fit is found by narrowing a prefix search.</p>
    <p>A used basket is set to zero, so it can never fit a later fruit.</p>
  </>} />
}
