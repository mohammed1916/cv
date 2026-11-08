import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DisjointSetView from '../../components/shared/DisjointSetView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every node begins as its own component.' },
    { id: 'union', label: 'Join', description: 'An edge joins two components into one.' },
    { id: 'same', label: 'Same component', description: 'An edge inside one component changes nothing.' },
    { id: 'count', label: 'Count pairs', description: 'Each component pairs with the nodes after it.' },
    { id: 'done', label: 'Complete', description: 'Report the unreachable pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges, e.g. {"n":7,"edges":[[0,2],[0,5]]}',
  url: 'https://leetcode.com/problems/count-unreachable-pairs-of-nodes-in-an-undirected-graph/',
  complexity: 'O(n + m * alpha(n)) time with union-find. The visualization caps n at 20 nodes.',
  examples: [
    { label: 'Own case 1', input: '{"n":8,"edges":[[1,3],[1,6],[3,5],[2,7],[6,5]]}' },
    { label: 'Own case 2', input: '{"n":4,"edges":[[1,2],[1,3],[2,3]]}' },
    { label: 'Single node, no edges', input: '{"n":1,"edges":[]}' },
    { label: 'Two isolated nodes', input: '{"n":2,"edges":[]}' },
    { label: 'One cycle joins all nodes', input: '{"n":4,"edges":[[0,1],[1,2],[2,3],[3,0]]}' },
    { label: 'Largest graph, no edges', input: '{"n":20,"edges":[]}' },
    { label: 'Long run: 20 nodes, 30 edges', input: '{"n":20,"edges":[[2,6],[12,7],[18,6],[12,9],[13,12],[12,15],[0,5],[16,19],[8,10],[18,8],[13,6],[18,9],[0,3],[1,16],[4,5],[8,15],[6,14],[15,17],[13,9],[11,16],[15,2],[10,15],[3,11],[11,10],[0,16],[15,18],[11,13],[2,4],[4,15],[11,14]]}' },
  ],
}

export default function CountUnreachablePairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DisjointSetView parent={step.parent} size={step.size} ops={[]} />
    <output aria-label="Unreachable pairs so far">{`Node ${step.node ?? '-'}: ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Two nodes can reach each other exactly when they share a component. Union-find merges components as edges arrive.</p>
    <p>Each pair of nodes in different components is unreachable, so the answer counts pairs across the components, one component at a time.</p>
  </>} />
}
