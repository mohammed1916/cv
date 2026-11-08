import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2281',
  phases: [
    { id: 'weakest', label: 'Weakest', description: 'For each wizard, find the groups where it is the weakest, between its left and right boundaries.' },
    { id: 'done', label: 'Result', description: 'Add every contribution and reduce modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"strength": [1, 3, 1, 2]}',
  url: 'https://leetcode.com/problems/sum-of-total-strength-of-wizards/',
  complexity: 'O(n) time with a monotonic stack and prefix sums of prefix sums, and O(n) space.',
  examples: [
    { label: 'Example', input: '{"strength":[1,3,1,2]}' },
    { label: 'Three', input: '{"strength":[5,4,6]}' },
    { label: 'Single wizard', input: '{"strength":[4]}' },
    { label: 'Equal strengths', input: '{"strength":[2,2,2]}' },
    { label: 'Twelve wizards, extremes', input: '{"strength":[20,1,20,1,20,1,20,1,20,1,20,1]}' },
    { label: 'Long run: 12 wizards', input: '{"strength":[2,2,11,14,12,10,4,19,1,13,3,5]}' },
  ],
}

export default function WizardStrength() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = run.input.strength
    return <>
      <IndexedSequence label="strength" length={s.length} valueAt={i => s[i]} active={step.i}
        roleAt={i => (i === step.i ? 'weakest' : step.l >= 0 && i === step.l ? 'l' : step.r >= 0 && i === step.r ? 'r' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
      <output aria-label="Running total">{`total ${step.total}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Each group's total strength is its weakest member times its sum. Count each group once by giving it to its leftmost weakest wizard.</p>
    <p>For a wizard, the groups where it is that weakest member start between its left boundary and itself, and end between itself and its right boundary. Prefix sums of prefix sums give the sum of all those group sums in constant time.</p>
  </>} />
}
