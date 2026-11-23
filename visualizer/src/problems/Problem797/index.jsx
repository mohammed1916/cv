import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecursiveCallTree from '../../components/shared/RecursiveCallTree'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { edgesFromAdjacency } from '../../components/shared/graphTraversalModel'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin DFS at node 0.' },
    { id: 'push', label: 'Extend path', description: 'Follow an outgoing edge.' },
    { id: 'emit', label: 'Record path', description: 'Target reached; save a copy of the path.' },
    { id: 'pop', label: 'Backtrack', description: 'Remove the last node and try the next edge.' },
    { id: 'done', label: 'Complete', description: 'All paths found.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'DAG adjacency list (JSON)',
  url: 'https://leetcode.com/problems/all-paths-from-source-to-target/',
  complexity: 'O(2^n * n) worst case for n nodes (output-bound). Visualization limited to 10 nodes.',
  question: "In a directed acyclic graph with n nodes, list every path from node 0 to node n - 1.",
  approaches: [
    { name: "DFS with backtracking", intuition: "Walk every outgoing edge from the current node, record the path when the target is reached, and step back.", time: "O(2^n * n) output-bound", space: "O(n) recursion plus output" },
    { name: "BFS carrying paths", intuition: "Queue partial paths and emit the ones that end at the target.", time: "O(2^n * n)", space: "O(2^n * n)" },
  ],
  examples: [
    { label: '4 nodes, 2 paths', input: '[[1,2],[3],[3],[]]' },
    { label: '5 nodes, 5 paths', input: '[[4,3,1],[3,2,4],[3],[4],[]]' },
    { label: 'Single edge', input: '[[1],[]]' }, { label: 'Two nodes, one edge', input: '[[1],[]]' }, { label: 'Chain of ten nodes', input: '[[1],[2],[3],[4],[5],[6],[7],[8],[9],[]]' }, { label: 'Dense: ten nodes, all forward edges', input: '[[1,2,3,4,5,6,7,8,9],[2,3,4,5,6,7,8,9],[3,4,5,6,7,8,9],[4,5,6,7,8,9],[5,6,7,8,9],[6,7,8,9],[7,8,9],[8,9],[9],[]]' },
  ],
}
export default function AllPathsSourceTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const prev = run.frames[run.frames.indexOf(step) - 1], pushed = step.phase === 'push'
    const from = pushed ? step.path[step.path.length - 2] : step.u
    return <>
    <GraphTraversalView title="DAG: the DFS stack is the current path" n={run.input.length} directed edges={edgesFromAdjacency(run.input, true)}
      current={step.u >= 0 ? from : null} neighbour={pushed ? step.u : null} visited={step.path} frontier={step.path} prevFrontier={prev ? prev.path : []} frontierKind="stack"
      frontierTitle="DFS stack = current path (top is last)" notes={pushed ? [`Following edge ${from} -> ${step.u}.`] : []}
      legend={{ current: 'node being explored', neighbour: 'edge just followed to', frontier: 'on the current path', visited: 'on the current path' }} />
    <IndexedSequence label="Adjacency lists" length={run.input.length} active={step.u} valueAt={i => run.input[i].join(',') || '-'} roleAt={i => step.path.includes(i) ? 'on-path' : ''} />
    <IndexedSequence label="Current path" length={Math.max(step.path.length, 1)} valueAt={i => step.path[i] ?? ' '} active={step.path.length - 1} />
    <IndexedSequence label="Recorded paths (latest 8)" length={Math.min(step.count, 8)} indexOffset={Math.max(0, step.count - 8)} valueAt={i => run.result[Math.max(0, step.count - 8) + i].join('>')} />
    <output aria-label="Path count">Paths found: {step.count}</output>
    <RecursiveCallTree nodes={run.tree} activeNodeId={step.activeNodeId} emptyLabel="No calls yet."
      getTitle={node => `node ${node.u}`} getSubtitle={node => node.subtitle} />
  </>}} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Because the graph is acyclic, DFS never revisits a node on the current path, so no visited set is needed; every distinct walk from 0 to the last node is a distinct path.</p>
  </>} />
}
