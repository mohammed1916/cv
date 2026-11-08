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
    { label: 'Own: five jobs, two workers', input: '{"jobs":[5,5,4,4,8],"k":2}' },
    { label: 'Five jobs, three workers', input: '{"jobs":[10,4,7,12,6],"k":3}' },
  { label: 'Single job', input: '{"jobs":[5],"k":1}' },
  { label: 'Equal jobs', input: '{"jobs":[4,4,4,4],"k":2}' },
  { label: 'Longest job times', input: '{"jobs":[60,60,60,60,60,60,60,60],"k":3}' },
  { label: 'Long run: 8 jobs', input: '{"jobs":[55,34,35,27,43,56,2,11],"k":3}' },
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
