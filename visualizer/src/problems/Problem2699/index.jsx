import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Park unknowns', description: 'Give unknown edges a huge weight and measure the fixed-edge distance.' },
    { id: 'try', label: 'Open an edge', description: 'Set the next unknown edge to 1 and measure the distance again.' },
    { id: 'raise', label: 'Raise edge', description: 'Raise the edge so a route through it has exactly the target length.' },
    { id: 'done', label: 'Complete', description: 'Return the modified edges, or an empty list if the target cannot be met.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Undirected graph with -1 unknown edges (JSON)',
  url: 'https://leetcode.com/problems/modify-graph-edge-weights/',
  complexity: 'O(E) runs of Dijkstra, so O(E * (V + E) log V) time. The visualization caps input at 5 nodes and 8 edges.',
  examples: [
    { label: 'Example', input: '{"n":2,"edges":[[0,1,-1]],"source":0,"destination":1,"target":5}' },
    { label: 'Impossible', input: '{"n":3,"edges":[[0,1,4],[1,2,3],[0,2,-1]],"source":0,"destination":2,"target":3}' },
  ],
}

export default function ModifyEdgeWeights() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Edges (a-b, weight; -1 means unknown)" length={step.edges.length} active={step.current}
      valueAt={i => `${step.edges[i][0]}-${step.edges[i][1]}: ${step.edges[i][2] >= 2000000000 ? 'huge' : step.edges[i][2]}`}
      roleAt={i => (run.input.edges[i][2] === -1 ? 'unknown' : 'fixed')} />
    <output aria-label="Distance">{`Distance from ${run.input.source} to ${run.input.destination}: ${step.d === Infinity ? '∞' : step.d} (target ${run.input.target})`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each unknown edge is opened in turn. Once an edge is set to 1, the distance can only drop, so the first edge that brings the distance to the target or below can be raised to fill the gap exactly.</p>
  </>} />
}
