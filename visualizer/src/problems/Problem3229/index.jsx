import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Compute the required change at each index.' },
    { id: 'step', label: 'Index', description: 'Count the new rises and falls this index needs.' },
    { id: 'done', label: 'Complete', description: 'Add the rises and falls.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two arrays (JSON object with nums and target)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-equal-to-target/',
  complexity: 'O(n) time and O(1) space. The visualization caps input at 10 entries.',
  examples: [
    { label: 'Four pairs, mixed', input: '{"nums":[3,8,2,11],"target":[6,9,4,12]}' },
    { label: 'Three pairs, reversed', input: '{"nums":[9,4,1],"target":[1,4,9]}' },
    { label: 'One pair', input: '{"nums":[1],"target":[1]}' },
    { label: 'Equal values tie', input: '{"nums":[5,5,5],"target":[5,5,5]}' },
    { label: 'Largest values alternating', input: '{"nums":[20,1,20,1,20,1,20,1,20,1],"target":[1,20,1,20,1,20,1,20,1,20]}' },
    { label: 'Long run: 10 pairs', input: '{"nums":[16,11,12,13,7,5,17,16,14,7],"target":[18,12,13,11,4,11,13,10,13,13]}' },
  ],
}

export default function EqualToTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Required change target minus nums" length={step.diff.length} valueAt={i => step.diff[i]} active={step.cursor} />
    <output aria-label="Operations">{`Increments: ${step.rises}, decrements: ${step.falls}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>An increment and a decrement can never share one operation, so the positive and negative needs are counted separately.</p>
  </>} />
}
