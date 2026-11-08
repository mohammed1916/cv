import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import WeightedGraphView from '../../components/shared/WeightedGraphView'
import { wgraphState } from '../../components/shared/wgraphModel.js'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Load the initial directed edges.' },
    { id: 'add', label: 'Add edge', description: 'Append an edge to the growing graph.' },
    { id: 'query', label: 'Dijkstra', description: 'Run Dijkstra from the source over the current edges.' },
    { id: 'answer', label: 'Answer', description: 'Record the distance to the target.' },
    { id: 'done', label: 'Complete', description: 'Return every answer in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Graph and operations (JSON)',
  url: 'https://leetcode.com/problems/design-graph-with-shortest-path-calculator/',
  complexity: 'Each shortestPath costs O(E log V). The visualization caps input at 6 nodes and 10 operations.',
  examples: [
    { label: 'Example', input: '{"n":4,"edges":[[0,2,5],[0,1,2],[1,2,1],[3,0,3]],"operations":[["shortestPath",3,2],["shortestPath",0,3],["addEdge",[1,3,4]],["shortestPath",0,3]]}' },
    { label: 'Smallest graph: unreachable', input: '{"n":2,"edges":[],"operations":[["shortestPath",0,1]]}' },
    { label: 'Equal-cost paths', input: '{"n":3,"edges":[[0,1,4],[0,2,2],[2,1,2]],"operations":[["shortestPath",0,1]]}' },
    { label: 'Largest graph: 10 operations', input: '{"n":6,"edges":[[0,1,10],[1,2,10],[2,3,10],[3,4,10],[4,5,10],[0,5,10],[5,0,1],[1,4,1]],"operations":[["shortestPath",0,5],["addEdge",[5,1,1]],["shortestPath",5,2],["addEdge",[2,0,3]],["shortestPath",2,0],["shortestPath",4,1],["addEdge",[1,5,2]],["shortestPath",3,3],["addEdge",[4,0,7]],["shortestPath",4,0]]}' },
  ],
}

export default function GraphShortestPathCalculator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <WeightedGraphView {...wgraphState({
      labels: Array.from({ length: run.input.n }, (_, i) => String(i)),
      edges: step.edges, directed: true, dist: step.dist, active: step.node,
      title: 'Directed graph (edges added so far)',
    }).wgraph} />
    <IndexedSequence label="Answers so far" length={step.answers.length} active={step.answers.length - 1} valueAt={i => step.answers[i]} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each query sees only the edges added before it, so every shortestPath call runs Dijkstra on the current graph rather than a cached result.</p>
  </>} />
}
