import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No cycle has been found yet.' },
    { id: 'walk', label: 'Walk', description: 'Follow the single outgoing edge and mark each node with its step.' },
    { id: 'cycle', label: 'Cycle', description: 'The walk came back to a node from this same walk.' },
    { id: 'done', label: 'Complete', description: 'Report the longest cycle, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with edges array; edges[i] is the outgoing node or -1 (JSON)',
  url: 'https://leetcode.com/problems/longest-cycle-in-a-graph/',
  complexity: 'O(n) time and O(n) space, since each node is marked once.',
  examples: [
    { label: 'Own: five nodes, one sink', input: '{"edges":[1,2,-1,4,0]}' },
    { label: 'Own: five nodes, two sinks', input: '{"edges":[4,0,-1,2,1]}' },
    { label: 'One node, no edge', input: '{"edges":[-1]}' },
    { label: 'Self loop', input: '{"edges":[0]}' },
    { label: 'Two-node cycle', input: '{"edges":[1,0]}' },
    { label: 'Largest cycle: 12 nodes', input: '{"edges":[1,2,3,4,5,6,7,8,9,10,11,0]}' },
    { label: 'Long run: 12 nodes', input: '{"edges":[-1,8,-1,2,9,-1,-1,10,-1,-1,5,-1]}' },
  ],
}

export default function LongestCycle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="edges (node to next node)" length={run.input.edges.length} valueAt={i => run.input.edges[i]} active={step.node} roleAt={i => (i === step.start ? 'start' : '')} />
    <output aria-label="Best">{`Longest cycle so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Every node has at most one outgoing edge, so a walk is forced. A cycle exists exactly when a walk reaches a node it already visited in the same walk.</p>
    <p>Nodes marked by an earlier walk are never walked again, which keeps the total work linear.</p>
  </>} />
}
