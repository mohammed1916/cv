import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Copy array', description: 'Work on a copy with a budget of one change.' },
    { id: 'scan', label: 'Compare pair', description: 'Check each adjacent pair from left to right.' },
    { id: 'fix', label: 'Spend the change', description: 'Lower the left value or raise the right one.' },
    { id: 'fail', label: 'Second descent', description: 'Two descents cannot be fixed by one change.' },
    { id: 'done', label: 'Answer', description: 'The array can be made non-decreasing.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array (JSON array of integers)',
  url: 'https://leetcode.com/problems/non-decreasing-array/',
  complexity: 'O(n) time and O(n) space for the working copy.',
  examples: [
    { label: 'Fixable', input: '[5,7,3,9]' },
    { label: 'Early drop', input: '[2,1,4,6]' },
    { label: 'Two drops', input: '[8,5,2]' },
  ],
}

export default function NonDecreasing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Working copy (changes spent so far)" length={step.a.length} active={step.index}
      valueAt={i => step.a[i]}
      roleAt={i => (step.fixed === i ? 'changed' : i === step.index - 1 ? 'l' : i === step.index ? 'r' : '')} />
    <output aria-label="Changes spent">{`Changes spent: ${step.changes} of 1`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the choice:</strong> lowering the left value helps when the value before it is small; otherwise raising the right value is the only change that keeps the order.</p>
  </>} />
}
