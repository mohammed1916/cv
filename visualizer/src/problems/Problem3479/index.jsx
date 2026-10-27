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
    { label: 'Example 1', input: '{"fruits":[4,2,5],"baskets":[3,5,4]}' },
    { label: 'Example 2', input: '{"fruits":[3,6,1],"baskets":[6,4,7]}' },
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
