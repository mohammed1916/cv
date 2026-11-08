import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RouteGraphView from './RouteGraphView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '1059',
  phases: [
    { id: 'enter', label: 'Enter', description: 'Walk into a node and put it on the path.' },
    { id: 'edge', label: 'Edge', description: 'Follow an outgoing edge.' },
    { id: 'known', label: 'Known', description: 'A node already proven good.' },
    { id: 'sink', label: 'Sink', description: 'A node with no way out.' },
    { id: 'continue', label: 'Continue', description: 'The destination has an outgoing edge.' },
    { id: 'cycle', label: 'Cycle', description: 'The path returns to itself.' },
    { id: 'settle', label: 'Settle', description: 'Every continuation is good.' },
    { id: 'done', label: 'Result', description: 'Report the answer.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n, edges ([from, to] pairs), source and destination',
  url: 'https://leetcode.com/problems/all-paths-from-source-lead-to-destination/description/',
  complexity: 'O(V + E) time and O(V + E) space for V nodes and E edges, from a depth-first search. The visualization caps the graph at 8 nodes and 12 edges; the official bounds are not verified.',
  examples: [
    { label: 'Dead end', input: '{"n":3,"edges":[[0,1],[0,2]],"source":0,"destination":1}' },
    { label: 'Chain', input: '{"n":3,"edges":[[0,1],[1,2]],"source":0,"destination":2}' },
    { label: 'Diamond', input: '{"n":4,"edges":[[0,1],[0,2],[1,3],[2,3]],"source":0,"destination":3}' },
    { label: 'Self loop', input: '{"n":3,"edges":[[0,1],[1,1]],"source":0,"destination":1}' },
    { label: 'Single node, same start and end', input: '{"n":1,"edges":[],"source":0,"destination":0}' },
    { label: 'Direct edge', input: '{"n":2,"edges":[[0,1]],"source":0,"destination":1}' },
    { label: 'Largest graph: eight nodes, twelve edges', input: '{"n":8,"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[0,4],[2,6],[1,5],[3,7]],"source":0,"destination":5}' },
    { label: 'Long run: eight nodes, twelve random edges', input: '{"n":8,"edges":[[6,0],[7,4],[0,7],[3,7],[6,5],[6,1],[1,2],[3,0],[5,2],[3,2],[1,3],[2,7]],"source":0,"destination":7}' },
  ],
}

export default function AllPathsToDestination() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RouteGraphView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} The search keeps the current path; returning to a node on that path is a cycle, and any dead end other than the destination ends the search as false.</p>}
    />
  )
}
