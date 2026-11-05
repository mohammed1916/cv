import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Choose employee', description: 'Start the depth-first walk at the given id.' },
    { id: 'visit', label: 'Count and descend', description: 'Add the importance, then visit each direct subordinate.' },
    { id: 'done', label: 'Total', description: 'The walk has counted the whole subtree.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Employees and id (JSON object)',
  url: 'https://leetcode.com/problems/employee-importance/',
  complexity: 'O(n) time for n employees and O(depth) recursion space.',
  examples: [
    { label: 'Two reports', input: '{"employees":[[1,5,[2,3]],[2,3,[]],[3,2,[]]],"id":1}' },
    { label: 'Middle manager', input: '{"employees":[[10,4,[11]],[11,6,[12,13]],[12,1,[]],[13,2,[]]],"id":11}' },
    { label: 'Leaf', input: '{"employees":[[7,9,[]]],"id":7}' },
  ],
}

export default function EmployeeImportance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecordStateTable label={`Counted from ${run.input.id}`} columns={['employee', 'importance']}
      rows={step.counted.map(c => ({ employee: c.id, importance: c.importance }))} activeRow={step.counted.length - 1} />
    <output aria-label="Running total">{`Total so far: ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why depth-first:</strong> an employee's total is their own importance plus their subordinates' totals, so the walk counts each subtree once.</p>
  </>} />
}
