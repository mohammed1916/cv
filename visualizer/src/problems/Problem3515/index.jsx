import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SubtreeRangeView from './SubtreeRangeView'
import { buildTrace, code, parseInput, phases, python } from './algorithm'

const definition = {
  number: '3515',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges [u, v, w] and queries ([1, u, v, w] to change a weight, [2, x] to ask a distance)',
  url: 'https://leetcode.com/problems/shortest-path-in-a-weighted-tree/',
  complexity: 'O((n + q) log n) time and O(n) space. Officially n and q reach 100000; the drawing caps n at 15 and q at 12.',
  examples: [
    { label: 'Branching tree', input: '{"n":6,"edges":[[1,2,3],[1,3,5],[2,4,2],[2,5,6],[3,6,1]],"queries":[[2,5],[1,1,2,8],[2,5],[2,4],[1,6,3,4],[2,6],[2,1]]}' },
    { label: 'Chain, ends reversed', input: '{"n":5,"edges":[[5,4,2],[3,2,7],[4,3,1],[1,2,4]],"queries":[[2,5],[1,3,4,9],[2,5],[2,3]]}' },
    { label: 'Root only', input: '{"n":1,"edges":[],"queries":[[2,1]]}' },
    { label: 'Single node with one distance query', input: '{"n":1,"edges":[],"queries":[[2,1]]}' },
    { label: 'Two nodes and an update', input: '{"n":2,"edges":[[1,2,4]],"queries":[[2,1],[1,1,2,7],[2,2]]}' },
    { label: 'Equal weights tie', input: '{"n":4,"edges":[[1,2,3],[1,3,3],[1,4,3]],"queries":[[2,2],[2,3],[2,4]]}' },
    { label: 'Long run: 15 nodes, 12 queries', input: '{"n":15,"edges":[[2,1,7019],[3,1,2456],[4,2,3452],[5,1,6757],[6,3,5201],[7,1,6516],[8,4,8446],[9,7,2508],[10,2,4821],[11,4,6107],[12,3,8691],[13,9,3167],[14,4,5936],[15,4,4051]],"queries":[[1,2,1,3742],[2,10],[1,7,1,1135],[2,3],[1,10,2,1585],[2,15],[1,14,4,1036],[1,8,4,1098],[1,15,4,4659],[2,14],[2,8],[1,12,3,381]]}' },
  ],
}

export default function ShortestPathInAWeightedTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SubtreeRangeView run={run} step={step} />} renderReasoning={() => <>
    <p>A tree has exactly one route from the root to each node, so a distance is simply the total of the edges on that route. No search is needed.</p>
    <p>Changing one edge shifts the distance of every node below it and of nothing else. Numbering nodes in visit order places each subtree in one unbroken run of positions, so that change becomes a range add.</p>
    <p>A Fenwick tree over the differences handles this with two point updates per range, and a distance is a prefix sum. Watch the strip: the first update raises everything from the start of the range, and the second brings the positions past the range back down.</p>
  </>} />
}
