import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order processors by availability and tasks from largest to smallest.' },
    { id: 'assign', label: 'Assign four', description: 'Give the next four tasks to this processor and record its finish time.' },
    { id: 'done', label: 'Complete', description: 'Report the latest finish time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with processorTime (1 to 3 entries) and tasks (four per processor)',
  url: 'https://leetcode.com/problems/minimum-processing-time/',
  complexity: 'O(n log n) time for the sorts, where n is the number of tasks. The visualization caps input at 3 processors.',
  examples: [
    { label: 'Example 1', input: '{"processorTime":[8,10],"tasks":[2,2,3,1,8,7,4,5]}' },
    { label: 'Example 2', input: '{"processorTime":[10,20],"tasks":[2,3,1,2,5,8,4,3]}' },
  ],
}

export default function MinimumProcessingTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Finish time per processor (earliest-free first)" length={run.input.processorTime.length} valueAt={i => step.finish[i] ?? '…'} active={step.index} roleAt={i => (step.finish[i] !== undefined ? 'finished' : '')} />
    <output aria-label="Best finish so far">{`Latest finish so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>The answer is the latest finish time over all processors. Each processor’s finish time is its availability plus the largest of its four tasks.</p>
    <p>Giving the earliest-free processor the four largest tasks is the greedy choice that keeps the maximum as small as possible.</p>
  </>} />
}
