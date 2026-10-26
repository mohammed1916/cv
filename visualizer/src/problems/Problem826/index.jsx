import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort jobs by difficulty and workers by ability.' },
    { id: 'absorb', label: 'Unlock job', description: 'Advance the pointer over jobs the worker can do and update the best profit.' },
    { id: 'pay', label: 'Assign worker', description: 'The worker earns the best profit among reachable jobs.' },
    { id: 'done', label: 'Complete', description: 'Return the summed profit.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Object with difficulty, profit, worker (JSON)',
  url: 'https://leetcode.com/problems/most-profit-assigning-work/',
  complexity: 'O(n log n + m log m) time for sorting; the two-pointer sweep is O(n + m).',
  examples: [
    { label: 'Official example', input: '{"difficulty":[2,4,6,8,10],"profit":[10,20,30,40,50],"worker":[4,5,6,7]}' },
    { label: 'Too hard', input: '{"difficulty":[85,47,57],"profit":[24,66,99],"worker":[40,25,25]}' },
    { label: 'Profit not monotone', input: '{"difficulty":[1,2,3],"profit":[50,10,5],"worker":[1,2,3]}' },
  ],
}
export default function MostProfitAssigningWork() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Jobs sorted by difficulty (difficulty/profit)" length={run.jobs.length} active={step.phase === 'absorb' ? step.i : -1}
      valueAt={i => `${run.jobs[i][0]}/${run.jobs[i][1]}`} roleAt={i => i < step.i || (step.phase === 'absorb' && i === step.i) ? 'unlocked' : ''} />
    <IndexedSequence label="Workers sorted by ability" length={run.workers.length} active={step.w} valueAt={i => run.workers[i]} roleAt={i => i < step.w || step.phase === 'done' ? 'paid' : ''} />
    <output aria-label="Profit">Best reachable profit {step.best} | total {step.total}</output>
  </>} renderReasoning={() => <>
    <p>Any worker may take any job at or below their ability, and the same job can be reused. So each worker simply wants the highest profit among jobs they can do.</p>
    <p>Sorting workers means the reachable job set only grows, so one pointer and a running maximum suffice.</p>
  </>} />
}
