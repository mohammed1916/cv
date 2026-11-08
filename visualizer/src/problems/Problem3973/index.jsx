import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GateTreeView from './GateTreeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3973', phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with parent, gates ([red, blue, white] per node) and queries ([aNode, aCard, bNode, bCard], card 0 is blue and 1 is red)',
  url: 'https://leetcode.com/problems/distinct-gate-paths-to-lca/',
  complexity: 'O((n + q) log n) time and O(n log n) space, with counts taken modulo 1000000007. The official limits are 20000 nodes and queries; the visualization caps at 15 nodes and 6 queries.',
  examples: [
    { label: 'Branching tree', input: '{"parent":[-1,0,0,1,1,2],"gates":[[0,0,0],[2,1,1],[1,0,2],[1,2,1],[0,3,2],[2,2,0]],"queries":[[3,1,4,0],[5,0,4,1],[3,0,1,1]]}' },
    { label: 'Long chain with big jumps', input: '{"parent":[-1,0,1,2,3,4],"gates":[[1,1,1],[2,1,3],[1,4,1],[3,0,2],[2,2,2],[1,3,1]],"queries":[[5,1,0,0],[5,0,2,1]]}' },
    { label: 'Stuck with no usable gate', input: '{"parent":[-1,0,0],"gates":[[1,1,1],[3,0,0],[0,2,1]],"queries":[[1,0,2,0],[1,1,2,1]]}' },
    { label: 'Same node', input: '{"parent":[-1,0],"gates":[[2,2,2],[1,1,1]],"queries":[[1,0,1,1]]}' },
    { label: "Single edge to the root", input: '{"parent":[-1,0],"gates":[[1,0,0],[0,1,0]],"queries":[[1,1,0,0]]}' },
    { label: "Equal gates tie", input: '{"parent":[-1,0,0],"gates":[[1,1,1],[1,1,1],[1,1,1]],"queries":[[1,0,2,0]]}' },
    { label: "Star with the largest gate counts", input: '{"parent":[-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"gates":[[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10]],"queries":[[1,1,14,0],[14,0,1,1],[7,1,8,0],[3,0,3,1],[14,1,2,0],[5,0,9,1]]}' },
    { label: "Long run: 15 nodes", input: '{"parent":[-1,0,1,0,2,1,1,5,4,5,8,4,5,8,6],"gates":[[8,8,9],[8,10,0],[3,4,1],[9,9,1],[7,4,4],[8,3,7],[10,7,9],[2,9,2],[6,0,7],[10,8,3],[5,5,6],[1,1,6],[6,8,4],[9,2,5],[4,6,1]],"queries":[[11,1,8,1],[8,1,10,0],[9,1,5,1],[9,0,9,0],[7,1,3,1],[8,1,8,0]]}' },
  ],
}

export default function DistinctGatePathsToLca() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <GateTreeView run={run} step={step} />} renderReasoning={() => <>
    <p>Only two things matter during a climb: the node and the card held. Leaving a node is therefore a 2 by 2 matrix: how many gates take each card to each card. A climb is the product of those matrices along the path.</p>
    <p>Walking every path per query would be too slow on a long chain, and some matrices cannot be inverted, so prefix products cannot be divided out. Storing products for jumps of 1, 2, 4 and so on lets any distance be assembled from its binary digits.</p>
    <p>The climbs share nothing, so Alice's count times Bob's count is the number of ways for that query. A person already at the LCA uses no gate and contributes exactly 1.</p>
  </>} />
}
