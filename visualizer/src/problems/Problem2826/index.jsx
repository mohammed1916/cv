import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No values kept yet for groups 1, 2 and 3.' },
    { id: 'value', label: 'Extend run', description: 'Each value extends the longest kept run that ends at or below it.' },
    { id: 'done', label: 'Complete', description: 'Delete every value outside the kept run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, values 1 to 3 (JSON)',
  url: 'https://leetcode.com/problems/sorting-three-groups/',
  complexity: 'O(n) time and O(1) space. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,3,2,1]}' },
    { label: 'Example 2', input: '{"nums":[1,3,2,1,3,3]}' },
  ],
}

export default function SortingThreeGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Longest kept run ending at each value" values={[step.best.slice(1)]} rowLabels={['kept']}
      columnLabels={['1', '2', '3']} activeCell={step.value ? { row: 0, column: step.value - 1 } : null} />
    <output aria-label="Values">{`Values: ${run.input.nums.join(', ')}${step.value ? `; current ${step.value}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>The values left after deletions must be non-decreasing, so the task is to keep the longest such subsequence and delete the rest.</p>
    <p>Only three values exist, so the best kept run is tracked for each value, and each new value extends the best run among values at or below it.</p>
  </>} />
}
