import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up with every node unseen.' },
    { id: 'walk', label: 'Walk', description: 'Follow outgoing edges and mark the nodes on this walk.' },
    { id: 'cycle', label: 'Cycle', description: 'A cycle gives each of its nodes the cycle length.' },
    { id: 'unwind', label: 'Unwind', description: 'Nodes before the cycle take one more than the node they point to.' },
    { id: 'done', label: 'Complete', description: 'Report the visited count for every node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Edges as JSON, where edges[i] is the node that i points to, e.g. {"edges": [1,2,0,0]}',
  url: 'https://leetcode.com/problems/count-visited-nodes-in-a-directed-graph/',
  complexity: 'O(n) time and O(n) space, since every node is walked and answered once.',
  examples: [
    { label: 'Example 1', input: '{"edges": [1,2,0,0]}' },
    { label: 'Example 2', input: '{"edges": [1,2,3,4,0]}' },
  ],
}

export default function CountVisitedNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="Visited count per node (0 means not yet answered)" length={run.input.edges.length}
        valueAt={i => step.ans[i]} active={step.node ?? -1} roleAt={i => (step.path.includes(i) ? 'on-walk' : '')} />
      <output aria-label="Current walk">{`Current walk: ${step.path.length ? step.path.join(' -> ') : '(none)'}`}</output>
      <p>{step.message}</p>
    </>
  )} renderReasoning={() => (
    <>
      <p>Each node has one outgoing edge, so the nodes reached from a start form a path that either ends in a cycle or reaches a node already answered.</p>
      <p>The number of distinct nodes from a node on a cycle is the cycle length, and any node before the cycle is one more than the node it points to.</p>
    </>
  )} />
}
