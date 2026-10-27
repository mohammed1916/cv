import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'single', label: 'Single', description: 'A single value is reachable only if it is 1.' },
    { id: 'undo', label: 'Undo', description: 'Reverse one step: the largest value came from the sum of the rest.' },
    { id: 'done', label: 'Complete', description: 'Report whether the target can be built.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"target": [...]} with values 1 to 12',
  url: 'https://leetcode.com/problems/construct-target-array-with-multiple-sums/',
  complexity: 'O(n log n + steps * log n) time, where steps grow like the logarithm of the values. The visualization caps input at 5 values.',
  examples: [
    { label: 'Example 1', input: '{"target":[9,3,5]}' },
    { label: 'Example 2', input: '{"target":[1,1,1,2]}' },
    { label: 'Example 3', input: '{"target":[8,5]}' },
  ],
}

export default function TargetArrayMultipleSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Array being undone" length={step.values.length} valueAt={i => step.values[i]} active={step.picked} />
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each operation sets one position to the sum of all positions, so the new value is the largest in the array. Undoing a step means taking the largest value and removing the sum of the others from it.</p>
    <p>Reducing modulo the sum of the others jumps over many undo steps at once, which keeps the number of steps small.</p>
  </>} />
}
