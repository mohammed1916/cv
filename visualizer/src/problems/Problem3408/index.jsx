import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No tasks are stored yet.' },
    { id: 'add', label: 'Add', description: 'Store the task and push its priority into the heap.' },
    { id: 'edit', label: 'Edit', description: 'Store the new priority; the old heap entry becomes stale.' },
    { id: 'rmv', label: 'Remove', description: 'Delete the task from the map.' },
    { id: 'exec', label: 'Exec top', description: 'Skip stale entries, then run the highest priority task.' },
    { id: 'done', label: 'Complete', description: 'Every operation has been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"operations": [add | edit | rmv | execTop], "arguments": [...]}',
  url: 'https://leetcode.com/problems/design-task-manager/',
  complexity: 'O(log n) per add, edit, or execTop with a max heap and lazy deletion. The visualization caps input at 12 operations.',
  examples: [
    { label: 'Example', input: '{"operations":["add","add","add","add","edit","execTop","rmv","add","execTop"],"arguments":[[1,101,10],[2,102,20],[3,103,15],[4,104,5],[102,8],[],[101],[5,105,15],[]]}' },
    { label: 'Single task runs', input: '{"operations":["add","execTop"],"arguments":[[1,1,0],[]]}' },
    { label: 'Equal priority, larger id first', input: '{"operations":["add","add","execTop"],"arguments":[[1,10,5],[2,20,5],[]]}' },
    { label: 'Priority limits and an edit', input: '{"operations":["add","add","edit","execTop"],"arguments":[[5,1000,20],[1,1,0],[1,20],[]]}' },
    { label: 'Long run: 12 operations', input: '{"operations":["add","add","add","add","add","edit","execTop","rmv","add","execTop","execTop","execTop"],"arguments":[[1,11,4],[2,12,9],[3,13,9],[4,14,2],[5,15,20],[13,7],[],[14],[1,16,9],[],[],[]]}' },
  ],
}

export default function TaskManager() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Live tasks">
      <thead><tr><th scope="col">Task</th><th scope="col">User</th><th scope="col">Priority</th></tr></thead>
      <tbody>{step.tasks.length === 0 ? <tr><td colSpan={3}>No tasks</td></tr> : step.tasks.map(t => <tr key={t.task}><th scope="row">{t.task}</th><td>{t.user}</td><td>{t.priority}</td></tr>)}</tbody>
    </table>
    <output aria-label="Answer">{step.answer === null ? 'No execTop in this step.' : `execTop answered ${step.answer}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Edits and removals leave their old heap entries in place. Each entry records the priority it was pushed with, so an entry is stale once the task's current priority differs or the task is gone.</p>
    <p>Ties on priority go to the higher task id, which the heap order gives directly.</p>
  </>} />
}
