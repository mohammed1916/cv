import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RepairThresholdView from './RepairThresholdView'
import { buildTrace, parseInput, code, python } from './algorithm'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'

const definition = {
  phases: [
    { id: 'start', label: 'Candidates', description: 'List the thresholds that can matter.' },
    { id: 'top', label: 'Ceiling', description: 'Check that repairing everything is enough.' },
    { id: 'mid', label: 'Middle', description: 'Pick the middle candidate.' },
    { id: 'test', label: 'Test', description: 'Repair edges up to this threshold and count hops.' },
    { id: 'done', label: 'Result', description: 'Report the smallest workable threshold.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, k and edges ([u, v, cost] triples)',
  url: 'https://leetcode.com/problems/minimum-cost-to-repair-edges-to-traverse-a-graph/',
  complexity: 'O(E log E + log E * (n + E)) time: a binary search over sorted costs, with one breadth-first search per test. The visualization caps n at 10.',
  examples: [
    { label: 'Shortcut by repair', input: '{"n":5,"k":2,"edges":[[0,1,4],[1,4,7],[0,2,2],[2,3,6],[3,4,5],[1,3,1]]}' },
    { label: 'Too few hops', input: '{"n":3,"k":1,"edges":[[0,1,3],[1,2,8],[0,2,6]]}' },
  ],
}

export default function MinimumCostToRepairEdgesToTraverseAGraph() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>{step.candidates && step.lo != null && step.hi != null ? <AnswerRangeBar title="Candidate thresholds" min={step.candidates[0]} max={step.candidates[step.candidates.length - 1]} low={step.candidates[step.lo]} high={step.candidates[step.hi]} probe={step.mid == null ? null : step.candidates[step.mid]} verdict={step.ok} /> : null}<RepairThresholdView run={run} step={step} /></>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>A larger threshold repairs more edges, so whether a path of at most k edges exists only gets easier. That monotone property lets a binary search find the smallest workable threshold.</p>
    {run ? <p>Final answer: {run.result}.</p> : null}
  </>} />
}
