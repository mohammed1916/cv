import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Day zero, nothing has run.' },
    { id: 'next', label: 'Next task', description: 'Take the next task in order.' },
    { id: 'tick', label: 'Next day', description: 'Advance to the next free day.' },
    { id: 'wait', label: 'Wait', description: 'Too soon after the last run, so jump ahead.' },
    { id: 'run', label: 'Run', description: 'Record the day this task runs.' },
    { id: 'done', label: 'Result', description: 'The last day used is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with tasks (integers 1 to 20) and space (1 to 20)',
  url: 'https://leetcode.com/problems/task-scheduler-ii/',
  complexity: 'O(n) time and O(k) space for n tasks with k distinct types.',
  examples: [
    { label: 'Example', input: '{"tasks":[1,2,1,2,3,1],"space":3}' },
    { label: 'Tight', input: '{"tasks":[5,5,5],"space":1}' },
  ],
}

export default function TaskSchedulerII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Tasks" length={run.input.tasks.length} valueAt={i => run.input.tasks[i]} active={step.at}
      roleAt={i => (i < step.at ? 'done' : '')} />
    <output aria-label="Calendar">{`day ${step.day}, task ${step.task ?? '-'}, last days ${Object.entries(step.last).map(([t, d]) => `${t}:${d}`).join(' ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Tasks run in order, one per day. A task may run again only when more than space days have passed since its last run.</p>
    <p>When it is too soon, the calendar jumps to the first allowed day instead of stepping one day at a time.</p>
  </>} />
}
