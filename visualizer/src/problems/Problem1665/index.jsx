import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the tasks by minimum minus actual, largest first.' },
    { id: 'task', label: 'Check start', description: 'Find the energy this task needs before it starts.' },
    { id: 'spend', label: 'Spend', description: 'Finishing the task uses up its actual energy.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum initial energy.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with tasks: up to 12 [actual, minimum] pairs',
  url: 'https://leetcode.com/problems/minimum-initial-energy-to-finish-tasks/',
  complexity: 'O(n log n) time for n tasks. The visualization caps tasks at 12.',
  examples: [
    { label: 'Example 1', input: '{"tasks":[[1,2],[2,4],[4,8]]}' },
    { label: 'Example 2', input: '{"tasks":[[1,3],[2,4],[10,11],[10,12],[8,9]]}' },
  ],
}

export default function MinimumInitialEnergy() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Tasks [actual, minimum]" length={run.input.tasks.length} valueAt={index => `[${run.input.tasks[index].join(', ')}]`} active={step.task} />
    <output aria-label="Energy">{`Spent so far: ${step.spent}; best initial energy: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A task with a large slack needs a lot of energy to start, but leaves little to spend, so tasks with the largest slack go first.</p>
    <p>Before each task, the energy must cover everything spent earlier plus that task's minimum. The largest of those totals is the answer.</p>
  </>} />
}
