import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreeOutline from '../../components/shared/TreeOutline'
import TreeWalkView from '../../components/shared/TreeWalkView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the chosen employee.' },
    { id: 'visit', label: 'Add importance', description: 'Add this employee and push the reports.' },
    { id: 'done', label: 'Complete', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Employees and id (JSON object)',
  url: 'https://leetcode.com/problems/employee-importance/',
  complexity: 'O(n) time and O(n) space for the employee map and the stack.',
  examples: [
    { label: 'Chain of three', input: '{"employees":[[1,5,[2,3]],[2,3,[]],[3,3,[]]],"id":1}' },
    { label: 'Chain', input: '{"employees":[[1,2,[5]],[5,-3,[]]],"id":5}' },
  ],
}

// Reporting tree rooted at `id`; node ids are employee ids, so highlighting matches the walk.
function toTree(employees, id) {
  const byId = new Map(employees.map(e => [e[0], e]))
  const build = current => {
    const [, importance, subs] = byId.get(current)
    return { id: current, value: `${current}:${importance}`, children: subs.map(build) }
  }
  return build(id)
}

export default function EmployeeImportance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = Object.fromEntries(step.visited.map(id => [id, 'visited']))
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <TreeOutline title="Reporting tree (id:importance)" root={toTree(run.input.employees, run.input.id)} roles={roles} />
      {step.treeWalk && <TreeWalkView {...step.treeWalk} />}
      <output aria-label="Total importance">Total so far: {step.total} · visited {step.visited.join(', ') || '—'}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Stack walk:</strong> each employee is visited once, so the walk adds each reachable importance exactly once.</p>
  </>} />
}
