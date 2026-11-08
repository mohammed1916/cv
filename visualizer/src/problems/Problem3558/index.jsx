import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import EdgeWeightPathView from './EdgeWeightPathView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { meta } from './meta'

const chain = Array.from({ length: 32 }, (_, i) => [i + 1, i + 2])

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with edges, the edges of a tree on nodes 1 to n',
  url: 'https://leetcode.com/problems/number-of-ways-to-assign-edge-weights-i/',
  complexity: 'O(n) time and O(n) space. Replacing the counting loop with fast exponentiation of 2^(d-1) makes that part O(log d). The visualization caps n at 40.',
  examples: [
    { label: 'Branching tree', input: '{"edges":[[1,2],[1,3],[2,4],[2,5],[5,6],[3,7]]}' },
    { label: 'Two deepest nodes', input: '{"edges":[[4,1],[2,1],[3,2],[5,4]]}' },
    { label: 'Single edge', input: '{"edges":[[2,1]]}' },
    { label: 'Long chain, modulo applies', input: JSON.stringify({ edges: chain }) },
    { label: 'One edge', input: '{"edges":[[1,2]]}' },
    { label: 'Star around node 1', input: '{"edges":[[1,2],[1,3],[1,4]]}' },
    { label: 'Largest allowed size, 40 nodes', input: '{"edges":[[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,24],[24,25],[25,26],[26,27],[27,28],[28,29],[29,30],[30,31],[31,32],[32,33],[33,34],[34,35],[35,36],[36,37],[37,38],[38,39],[39,40]]}' },
    { label: 'Long run: 31 nodes', input: '{"edges":[[1,2],[1,3],[1,4],[3,5],[3,6],[5,7],[3,8],[7,9],[8,10],[4,11],[9,12],[12,13],[6,14],[1,15],[13,16],[15,17],[8,18],[13,19],[16,20],[18,21],[3,22],[22,23],[12,24],[6,25],[18,26],[10,27],[18,28],[5,29],[5,30],[5,31]]}' },
  ],
}

export default function NumberOfWaysToAssignEdgeWeightsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <EdgeWeightPathView run={run} step={step} />} renderReasoning={() => <>
    <p>Only the length of the path matters. Every deepest node gives a path with the same number of edges, so any of them gives the same count, and edges off the path are ignored.</p>
    <p>Weight 2 leaves the parity of the total alone and weight 1 flips it. So each edge sends every even total and every odd total into both columns, and the two counts stay equal from the first edge on.</p>
    <p>Put another way: choose the first d − 1 edges freely, then exactly one weight on the last edge makes the total odd. That gives 2^(d − 1) ways.</p>
  </>} />
}
