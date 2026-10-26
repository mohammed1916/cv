import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin DFS at node 0.' },
    { id: 'push', label: 'Extend path', description: 'Follow an outgoing edge.' },
    { id: 'emit', label: 'Record path', description: 'Target reached; save a copy of the path.' },
    { id: 'pop', label: 'Backtrack', description: 'Remove the last node and try the next edge.' },
    { id: 'done', label: 'Complete', description: 'All paths found.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'DAG adjacency list (JSON)',
  url: 'https://leetcode.com/problems/all-paths-from-source-to-target/',
  complexity: 'O(2^n * n) worst case for n nodes (output-bound). Visualization limited to 10 nodes.',
  examples: [
    { label: '4 nodes, 2 paths', input: '[[1,2],[3],[3],[]]' },
    { label: '5 nodes, 5 paths', input: '[[4,3,1],[3,2,4],[3],[4],[]]' },
    { label: 'Single edge', input: '[[1],[]]' },
  ],
}
export default function AllPathsSourceTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Adjacency lists" length={run.input.length} active={step.u} valueAt={i => run.input[i].join(',') || '-'} roleAt={i => step.path.includes(i) ? 'on-path' : ''} />
    <IndexedSequence label="Current path" length={Math.max(step.path.length, 1)} valueAt={i => step.path[i] ?? ' '} active={step.path.length - 1} />
    <IndexedSequence label="Recorded paths (latest 8)" length={Math.min(step.count, 8)} indexOffset={Math.max(0, step.count - 8)} valueAt={i => run.result[Math.max(0, step.count - 8) + i].join('>')} />
    <output aria-label="Path count">Paths found: {step.count}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Because the graph is acyclic, DFS never revisits a node on the current path, so no visited set is needed; every distinct walk from 0 to the last node is a distinct path.</p>
  </>} />
}
