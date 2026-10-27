import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin scanning 1..n.' },
    { id: 'invalid', label: 'Invalid digit', description: 'Contains 3, 4 or 7, so rotation is not a number.' },
    { id: 'same', label: 'Unchanged', description: 'Only 0, 1, 8: rotates to itself.' },
    { id: 'good', label: 'Good', description: 'Valid and different after rotation.' },
    { id: 'done', label: 'Complete', description: 'Return the count of good numbers.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Integer n (JSON)',
  url: 'https://leetcode.com/problems/rotated-digits/',
  complexity: 'O(n log n) time, O(n) for the visualization status array.',
  examples: [
    { label: 'n = 10', input: '10' },
    { label: 'n = 1', input: '1' },
    { label: 'n = 100', input: '100' },
  ],
}
export default function RotatedDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers 1..n (status after check)" length={run.input} indexOffset={1} active={step.x ? step.x - 1 : -1} valueAt={i => i + 1} roleAt={i => i + 1 <= step.x ? run.status[i] : ''} />
    <IndexedSequence label="Digits of current number" length={Math.max(step.digits.length, 1)} valueAt={i => step.digits[i] ?? ' '} roleAt={i => '347'.includes(step.digits[i]) ? 'invalid' : '2569'.includes(step.digits[i] ?? 'x') ? 'changes' : ''} />
    <output aria-label="Good count">Good numbers so far: {step.count}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Digits 0, 1, 8 rotate to themselves; 2 and 5 swap, 6 and 9 swap; 3, 4, 7 have no rotation. A number is good only with no bad digit and at least one swapping digit.</p>
  </>} />
}
