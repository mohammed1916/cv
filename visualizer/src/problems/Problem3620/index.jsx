import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import NetworkRecoveryView from './NetworkRecoveryView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with edges ([from, to, cost]), online (one boolean per node) and budget k',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O((n + m) log m) time: one linear pass over the graph for each of the O(log m) floors tried. The official limits allow 50000 nodes and 100000 edges; the visualization caps the graph at 10 nodes and 20 edges.',
  examples: [
    { label: 'Trade-off', input: '{"edges":[[0,1,8],[0,2,4],[1,3,6],[2,3,9],[1,4,2],[3,5,5],[4,5,7],[2,4,6]],"online":[true,true,true,true,true,true],"k":18}' },
    { label: 'Offline shortcut', input: '{"edges":[[0,1,9],[1,3,9],[0,2,3],[2,3,5]],"online":[true,false,true,true],"k":20}' },
    { label: 'Budget too small', input: '{"edges":[[0,1,6],[1,2,6]],"online":[true,true,true],"k":5}' },
    { label: 'No edges', input: '{"edges":[],"online":[true,true],"k":7}' },
    { label: 'Two nodes, direct edge', input: '{"edges":[[0,1,4]],"online":[true,true],"k":4}' },
    { label: 'Equal-cost routes', input: '{"edges":[[0,1,2],[1,2,2],[0,2,4]],"online":[true,true,true],"k":4}' },
    { label: 'Largest cost and budget', input: '{"edges":[[0,1,1000000000]],"online":[true,true],"k":50000000000000}' },
    { label: 'Long run: 10 nodes, tree of 9 edges', input: '{"edges":[[0,1,39],[1,2,24],[1,3,23],[0,4,31],[2,5,8],[1,6,7],[5,7,46],[0,8,12],[2,9,17]],"online":[true,true,true,true,true,false,true,false,true,true],"k":60}' },
  ],
}

export default function NetworkRecoveryPathways() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <NetworkRecoveryView run={run} step={step} />} renderReasoning={() => <>
    <p>Two goals pull against each other: a high minimum edge and a low total cost. Fixing the minimum first separates them. With a floor chosen, the only remaining question is the cheapest route using edges at or above that floor.</p>
    <p>Raising the floor only removes edges, so once a floor fails every higher floor fails too. That ordering is what makes binary search valid, and the answer is always the cost of some edge, so only real costs are tried.</p>
    <p>The graph has no cycles, so processing nodes in topological order settles each node before anything leaves it. One pass finds the cheapest route, with no priority queue needed.</p>
  </>} />
}
