import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every node begins with an edge score of zero.' },
    { id: 'add', label: 'Add index', description: 'Each node adds its index to the node it points to.' },
    { id: 'scan', label: 'Scan', description: 'Find the highest score, keeping the smaller index on ties.' },
    { id: 'done', label: 'Complete', description: 'Report the winning node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Edges as JSON, where edges[i] is the node that i points to, e.g. {"edges": [1,0,0,0]}',
  url: 'https://leetcode.com/problems/node-with-highest-edge-score/',
  complexity: 'O(n) time and O(n) space.',
  examples: [
    { label: 'Example 1', input: '{"edges": [1,0,0,0,0,7,7,5]}' },
    { label: 'Example 2', input: '{"edges": [2,0,0,2]}' },
  ],
}

export default function HighestEdgeScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="Edge score per node" length={run.input.edges.length} valueAt={i => step.score[i]}
        active={step.node ?? -1} roleAt={i => (i === step.best ? 'best' : '')} />
      <output aria-label="Current step">{step.message}</output>
    </>
  )} renderReasoning={() => (
    <>
      <p>The edge score of a node is the sum of the indexes of every node that points to it, so it is built by a single pass over the edges.</p>
      <p>Scanning the nodes in increasing order and replacing the best only on a strictly higher score returns the smallest index among ties.</p>
    </>
  )} />
}
