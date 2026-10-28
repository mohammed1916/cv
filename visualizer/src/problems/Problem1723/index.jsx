import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with every worker empty and no best peak.' },
    { id: 'assign', label: 'Assign', description: 'Give the next job to a worker whose peak stays below the best.' },
    { id: 'improve', label: 'New best', description: 'All jobs are placed with a lower peak than before.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest possible peak working time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"jobs": [...], "k": workers}',
  url: 'https://leetcode.com/problems/find-minimum-time-to-finish-all-jobs/',
  complexity: 'Backtracking over the ways to assign jobs, pruned by the best peak so far. The visualization caps input at 8 jobs.',
  examples: [
    { label: 'Example 1', input: '{"jobs":[3,2,3],"k":3}' },
    { label: 'Example 2', input: '{"jobs":[1,2,4,7,8],"k":2}' },
  ],
}

export default function MinimumTimeToFinishJobs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Jobs, largest first" length={run.sorted.length} valueAt={i => run.sorted[i]} active={step.job ?? -1} />
    <IndexedSequence label="Worker loads" length={run.input.k} valueAt={i => step.loads[i]} />
    <output aria-label="Best">{`Best peak so far: ${step.best ?? 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each job goes to exactly one worker, so the search tries every worker for the next job.</p>
    <p>A branch is dropped as soon as a worker's load would reach the best peak already found, and workers with equal loads are interchangeable.</p>
  </>} />
}
