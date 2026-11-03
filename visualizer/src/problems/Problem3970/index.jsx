import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RunStateView from './RunStateView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at node 0 with a run of one.' },
    { id: 'pick', label: 'Pick', description: 'Finalise the closest unfinished state.' },
    { id: 'relax', label: 'Relax', description: 'Try each outgoing edge and check the run limit.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest valid arrival.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with labels, k and edges ([from, to, weight])',
  url: 'https://leetcode.com/problems/shortest-path-with-at-most-k-consecutive-identical-characters/',
  complexity: 'Dijkstra over (node, run) states: O(S log S + E k) with a heap. This trace scans for the closest state, so it is O(S^2) on the small visual graphs.',
  examples: [
    { label: 'Run limit two', input: '{"labels":"abbab","k":2,"edges":[[0,1,2],[1,2,3],[2,4,1],[0,3,5],[3,4,1]]}' },
    { label: 'Run too long', input: '{"labels":"aaab","k":3,"edges":[[0,1,1],[1,2,1],[2,3,1]]}' },
  ],
}

export default function ShortestPathWithAtMostKConsecutiveIdenticalCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <RunStateView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>A state is a node plus the length of the identical run that ends there, so the run limit becomes an ordinary state constraint. {step.message} {run ? `Answer: ${run.result}.` : ''}</p>
  )} />
}
