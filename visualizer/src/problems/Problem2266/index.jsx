import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'With no presses, there is one way to write nothing.' },
    { id: 'run', label: 'Run', description: 'Count the ways to split a run of equal presses into letters.' },
    { id: 'multiply', label: 'Combine', description: 'Multiply the running total by the ways for this run.' },
    { id: 'done', label: 'Complete', description: 'Report the number of possible texts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with pressed_keys, a string of digits 2 to 9 (JSON)',
  url: 'https://leetcode.com/problems/count-number-of-texts/',
  complexity: 'O(n) time and O(n) space for n presses, with the total kept modulo 1000000007. The visualization caps input at 12 presses.',
  examples: [
    { label: 'Example 1', input: '{"pressed_keys":"22233"}' },
    { label: 'Example 2', input: '{"pressed_keys":"7777"}' },
  ],
}

export default function CountNumberOfTexts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Pressed keys" length={run.input.pressed_keys.length} valueAt={i => run.input.pressed_keys[i]}
      active={step.start} roleAt={i => (step.start >= 0 && i >= step.start && i < step.start + step.length ? 'run' : '')} />
    <output aria-label="Total">{step.ways.length > 0 ? `Ways for this run: ${step.ways.join(', ')}; total ${step.total}` : `Total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each letter uses one to three presses of its key, or one to four for keys 7 and 9.</p>
    <p>Runs of different digits are independent, so the answer is the product of the ways for each run.</p>
  </>} />
}
