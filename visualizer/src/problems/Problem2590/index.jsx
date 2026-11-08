import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'add', label: 'Add', description: 'Store a task for one user and return its id.' },
    { id: 'pending', label: 'List', description: 'Keep unfinished tasks, sorted by due date then id.' },
    { id: 'complete', label: 'Complete', description: 'Mark one of the user\'s tasks as done.' },
    { id: 'done', label: 'Result', description: 'Every query has been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"ops": [["add", 1, "Write", 20, []], ["list", 1]]}',
  url: 'https://leetcode.com/problems/design-a-todo-list/',
  complexity: 'Adding is O(1). A listing sorts that user\'s unfinished tasks, so it costs O(t log t) for t tasks. The visualization caps ops at 20.',
  examples: [
    { label: 'Tags and completion', input: '{"ops":[["add",2,"Plan",40,["work"]],["add",2,"Shop",15,[]],["add",2,"Review",40,["work"]],["tag",2,"work"],["complete",2,1],["list",2]]}' },
    { label: 'Other user', input: '{"ops":[["add",1,"Call",9,[]],["complete",2,1],["list",1]]}' },
    { label: 'Single task', input: '{"ops":[["add",1,"Ship",5,[]],["list",1]]}' },
    { label: 'Equal due dates', input: '{"ops":[["add",3,"A",10,[]],["add",3,"B",10,[]],["list",3]]}' },
    { label: 'Tag then complete every item', input: '{"ops":[["add",4,"X",2,["t"]],["tag",4,"t"],["complete",4,1],["list",4]]}' },
    { label: 'Long run: 19 operations', input: '{"ops":[["add",5,"Task",1,["w"]],["add",5,"Task",2,[]],["add",5,"Task",3,["w"]],["add",5,"Task",4,[]],["add",5,"Task",5,["w"]],["add",5,"Task",6,[]],["add",5,"Task",7,["w"]],["add",5,"Task",8,[]],["add",5,"Task",9,["w"]],["add",5,"Task",10,[]],["add",5,"Task",11,["w"]],["add",5,"Task",12,[]],["add",5,"Task",13,["w"]],["add",5,"Task",14,[]],["tag",5,"w"],["complete",5,3],["complete",5,8],["list",5],["list",6]]}' },
  ],
}

export default function DesignTodoList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    {step.tasks === null
      ? <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
      : <>
        <RecordStateTable label={`User ${step.user} tasks`} columns={['id', 'task', 'due', 'tags', 'status']}
          rows={step.tasks.map(t => ({ id: t.id, task: t.text, due: t.due, tags: t.tags.join(', ') || '-', status: t.done ? 'done' : (step.pending && step.pending.includes(t.id) ? `listed #${step.pending.indexOf(t.id) + 1}` : 'open') }))}
          activeRow={step.tasks.findIndex(t => step.pending ? step.pending.includes(t.id) : false)} />
        <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
      </>}
    {step.result !== null && <output aria-label="Result">{`Result: ${JSON.stringify(step.result)}`}</output>}
  </>} renderReasoning={() => <>
    <p>Each user owns a separate list of tasks. Completing a task only flags it, so the listing skips flagged tasks rather than removing them.</p>
    <p>Listings put the earliest due date first and break ties by the lower id; a tag query first narrows the same list to tasks carrying that tag.</p>
  </>} />
}
