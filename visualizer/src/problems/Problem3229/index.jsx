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
    { label: 'Example 1', input: '{"nums":[3,5,1,2],"target":[4,6,2,4]}' },
    { label: 'Example 2', input: '{"nums":[1,3,2],"target":[2,1,4]}' },
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
