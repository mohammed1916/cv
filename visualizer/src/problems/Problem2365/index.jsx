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
    { label: 'Own case 1', input: '{"tasks":[2,3,2,3,4,2],"space":4}' },
    { label: 'Tight', input: '{"tasks":[5,5,5],"space":1}' },
    { label: 'Single task', input: '{"tasks":[7],"space":1}' },
    { label: 'Equal task types', input: '{"tasks":[4,4,4,4],"space":4}' },
    { label: 'Largest space', input: '{"tasks":[20,1,20,1,20],"space":20}' },
    { label: 'Long run: 24 tasks', input: '{"tasks":[6,3,9,9,19,4,17,15,1,11,20,10,16,20,9,4,15,19,2,14,20,7,9,4],"space":5}' },
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
