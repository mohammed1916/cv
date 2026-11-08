import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DisjointSetView from '../../components/shared/DisjointSetView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Each row begins as its own component.' },
    { id: 'join', label: 'Join rows', description: 'Two rows share at least k values, so their components merge.' },
    { id: 'apart', label: 'Stay apart', description: 'Two rows share fewer than k values, so no edge is added.' },
    { id: 'done', label: 'Complete', description: 'Report the number of components.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with properties (rows of 1 to 6 values) and k, e.g. {"properties":[[1,2],[1,1]],"k":1}',
  url: 'https://leetcode.com/problems/properties-graph/',
  complexity: 'O(m^2 * w) time with a hash set per row, plus near-constant union-find. The visualization caps the table at 8 rows.',
  examples: [
    { label: 'Three by three grid, k two', input: '{"properties":[[2,5,3],[6,1,4],[4,9,2]],"k":2}' },
    { label: 'Example 2', input: '{"properties":[[1,2,3],[2,3,4],[4,5,6]],"k":2}' },
    { label: 'Single cell with k 1', input: '{"properties":[[5]],"k":1}' },
    { label: 'Equal rows tie', input: '{"properties":[[3,3],[3,3]],"k":2}' },
    { label: 'Largest values and k', input: '{"properties":[[10,1,10],[1,10,1]],"k":6}' },
    { label: 'Long run: 8 by 6 grid', input: '{"properties":[[3,7,4,5,8,8],[8,2,1,7,5,2],[9,2,6,1,6,5],[3,9,9,6,7,4],[7,2,4,9,2,9],[10,10,9,3,1,1],[2,5,2,1,9,6],[6,3,8,1,7,5]],"k":4}' },
  ],
}

export default function PropertiesGraph() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DisjointSetView parent={step.parent} size={step.size} ops={[]} />
    <output aria-label="Shared values">{step.pair ? `Rows ${step.pair[0]} and ${step.pair[1]} share ${step.shared} values` : 'No pair compared yet'}</output>
  </>} renderReasoning={() => <>
    <p>Each row is treated as a set of distinct values, and two rows are connected when their intersection has at least k values.</p>
    <p>Union-find merges connected rows, and the number of remaining roots is the number of components.</p>
  </>} />
}
