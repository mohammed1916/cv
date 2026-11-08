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
    { label: 'Two processors, eight tasks', input: '{"processorTime":[4,6],"tasks":[5,3,2,7,4,1,6,2]}' },
    { label: 'Three processors, twelve tasks', input: '{"processorTime":[2,9,5],"tasks":[6,1,4,8,3,7,2,5,9,1,4,6]}' },
    { label: "Single processor with zero start", input: "{\"processorTime\":[0],\"tasks\":[1,1,1,1]}" },
    { label: "Equal processor times", input: "{\"processorTime\":[5,5],\"tasks\":[2,2,2,2,2,2,2,2]}" },
    { label: "Largest times, three processors", input: "{\"processorTime\":[1000,1000,1000],\"tasks\":[1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000]}" },
    { label: "Long run: 3 processors, 12 tasks", input: "{\"processorTime\":[3,8,12],\"tasks\":[359,866,50,831,804,245,196,903,239,896,333,269]}" },
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
