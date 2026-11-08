import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TaskTreeView from './TaskTreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Children', description: 'Build the child lists.' },
    { id: 'order', label: 'Order', description: 'List the tasks so children come before parents.' },
    { id: 'leaf', label: 'Leaf', description: 'A leaf finishes at its own duration.' },
    { id: 'node', label: 'Nonleaf', description: 'Combine the child finishes with the task duration.' },
    { id: 'done', label: 'Result', description: 'Report the root finish time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with durations and edges ([parent, child] pairs, root 0)',
  url: 'https://leetcode.com/problems/finish-time-of-tasks-i/',
  complexity: 'O(n) time and space for n tasks after the child lists are built.',
  examples: [
    { label: 'Branching', input: '{"durations":[5,3,4,2],"edges":[[0,1],[0,2],[2,3]]}' },
    { label: 'Chain', input: '{"durations":[1,1,1,1,1],"edges":[[0,1],[1,2],[2,3],[3,4]]}' },
    { label: "Single task", input: '{"durations":[9],"edges":[]}' },
    { label: "Equal sibling durations", input: '{"durations":[3,3,3],"edges":[[0,1],[0,2]]}' },
    { label: "Maximum durations on a star", input: '{"durations":[100,100,100,100,100,100,100,100,100,100,100,100],"edges":[[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11]]}' },
    { label: "Long run: 12 tasks", input: '{"durations":[78,92,69,44,93,30,41,19,57,37,82,2],"edges":[[0,1],[1,2],[2,3],[1,4],[4,5],[1,6],[2,7],[1,8],[5,9],[3,10],[9,11]]}' },
  ],
}

export default function FinishTimeOfTasksI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <TaskTreeView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>{step.message} {run ? `Root finish time: ${run.result}.` : ''}</p>
  )} />
}
