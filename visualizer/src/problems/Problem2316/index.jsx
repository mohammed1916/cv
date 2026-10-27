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
    { label: 'Example 1', input: '{"n":7,"edges":[[0,2],[0,5],[2,4],[1,6],[5,4]]}' },
    { label: 'Example 2', input: '{"n":3,"edges":[[0,1],[0,2],[1,2]]}' },
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
