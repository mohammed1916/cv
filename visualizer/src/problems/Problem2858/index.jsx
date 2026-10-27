import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'build', label: 'Edges', description: 'Record each edge in both directions with its reversal cost.' },
    { id: 'root', label: 'Root 0', description: 'Count the edges that must be reversed for node 0 to reach everything.' },
    { id: 'reroot', label: 'Move start', description: 'Move the start across one edge and adjust the count by one step.' },
    { id: 'done', label: 'Complete', description: 'Report the answer for every starting node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree with n nodes and n-1 directed edges (JSON object)',
  url: 'https://leetcode.com/problems/minimum-edge-reversals-so-every-node-is-reachable/',
  complexity: 'O(n) time and O(n) space. The visualization caps the tree at 12 nodes.',
  examples: [
    { label: 'Two nodes', input: '{"n":2,"edges":[[0,1]]}' },
    { label: 'Star', input: '{"n":4,"edges":[[2,0],[2,1],[1,3]]}' },
  ],
}

export default function MinimumEdgeReversals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.current !== null) roles[step.current] = 'focus'
    return <>
      <RootedTreeDiagram title="Directed tree, rooted at node 0" root={run.tree} roles={roles} />
      <IndexedSequence label="Answer per starting node" length={run.result.length}
        valueAt={index => step.answer[index] ?? '-'} active={step.current ?? -1}
        roleAt={index => (step.answer[index] !== null ? 'set' : '')} />
    </>
  }} renderReasoning={() => <>
    <p>Rooting the tree at node 0 gives the count directly: every edge that points toward the root must be reversed.</p>
    <p>Moving the start across an edge flips that edge's direction, so the count changes by exactly one step, which avoids recounting the tree for each node.</p>
  </>} />
}
