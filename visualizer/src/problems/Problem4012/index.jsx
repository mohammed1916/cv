import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ShiftQueueView from './ShiftQueueView'
import { buildTrace, parseInput, code, python } from './algorithm'

const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the first task.' },
  { id: 'shift', label: 'Shift', description: 'A new shift receives its budget.' },
  { id: 'finish', label: 'Finish', description: 'A task completes inside the budget.' },
  { id: 'partial', label: 'Partial', description: 'The budget ends mid-task; progress carries over.' },
  { id: 'reset', label: 'Reset', description: 'Everything finished: end early and restart.' },
  { id: 'count', label: 'Count', description: 'Record the unfinished tasks.' },
  { id: 'done', label: 'Result', description: 'Report all shift counts.' },
]

const definition = {
  number: '4012',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with tasks (durations) and shifts (budgets)',
  url: 'https://leetcode.com/problems/count-of-unfinished-tasks-after-each-shift/',
  complexity: 'O(n + m) time for n tasks and m shifts, since each task pointer only moves forward within a pass. The visualization caps tasks at 8 and shifts at 12.',
  examples: [
    { label: 'Carry over', input: '{"tasks":[2,3],"shifts":[1,4,2]}' },
    { label: 'Early finish', input: '{"tasks":[5],"shifts":[5,5]}' },
    { label: 'Mixed', input: '{"tasks":[2,3,1],"shifts":[1,4,2,6]}' },
  ],
}

export default function CountOfUnfinishedTasks() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ShiftQueueView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Counts so far: ${step.answer.join(', ') || 'none'}.` : ''}
        </p>
      )}
    />
  )
}
