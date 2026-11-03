import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TaskTreeView from './TaskTreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const phases = [
  { id: 'start', label: 'Setup', description: 'Build the adjacency lists.' },
  { id: 'root', label: 'New root', description: 'Choose the next node as the root.' },
  { id: 'node', label: 'Finish node', description: 'Compute one node finish time.' },
  { id: 'keep', label: 'Keep', description: 'This root is the best so far.' },
  { id: 'skip', label: 'Skip', description: 'This root is not better.' },
  { id: 'done', label: 'Result', description: 'Report the smallest root finish time.' },
]

const definition = {
  number: '3967',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with baseTime (per node) and edges (pairs of node indices)',
  url: 'https://leetcode.com/problems/finish-time-of-tasks-ii/',
  complexity: 'O(n^2) time for the visualization, which tries each root with a full traversal; O(n) space per traversal. The visualization caps the tree at 8 nodes and base times at 9.',
  examples: [
    { label: 'Path', input: '{"baseTime":[1,1,1],"edges":[[0,1],[1,2]]}' },
    { label: 'Branch', input: '{"baseTime":[2,4,1,3],"edges":[[0,1],[1,2],[1,3]]}' },
    { label: 'Pair', input: '{"baseTime":[3,5],"edges":[[0,1]]}' },
  ],
}

export default function FinishTimeOfTasksII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TaskTreeView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer so far: ${step.best ?? 'none yet'}.` : ''}
        </p>
      )}
    />
  )
}
