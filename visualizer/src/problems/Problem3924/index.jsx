import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Candidates', description: 'List the thresholds: zero and every edge weight.' },
    { id: 'try', label: 'Try threshold', description: 'Count the fewest heavy edges to each node for this threshold.' },
    { id: 'found', label: 'Found', description: 'The target is reachable within k heavy edges.' },
    { id: 'none', label: 'Impossible', description: 'No threshold works.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"n", "edges": [[u, v, w], ...], "source", "target", "k"}',
  url: 'https://leetcode.com/problems/minimum-threshold-path-with-limited-heavy-edges/',
  complexity: 'O(E log E) for sorting the thresholds, plus one O(V + E) 0-1 search per threshold. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"n":6,"edges":[[0,1,5],[1,2,3],[3,4,4],[4,5,1],[1,4,2]],"source":0,"target":3,"k":1}' },
    { label: 'Example 2', input: '{"n":6,"edges":[[0,1,3],[1,2,4],[3,4,5],[4,5,6]],"source":0,"target":4,"k":1}' },
  ],
}

export default function MinimumThresholdPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Fewest heavy edges to each node" length={run.input.n} valueAt={j => (step.dist[j] === null ? '-' : step.dist[j])} active={run.input.target} roleAt={j => (j === run.input.source ? 'source' : '')} />
    <output aria-label="Threshold">{`Candidates: ${step.candidates.join(', ')}. Current threshold: ${step.t ?? '-'}. Allowed heavy edges: ${run.input.k}.`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The answer is always one of the edge weights or zero, so only those thresholds need to be tried, smallest first.</p>
    <p>For a fixed threshold, the number of heavy edges on a path is a 0-1 cost, so a 0-1 search gives the fewest heavy edges to every node.</p>
  </>} />
}
