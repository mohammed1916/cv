import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin checking from position 0.' },
    { id: 'match', label: 'Match', description: 'The count of this digit equals the digit at this position.' },
    { id: 'mismatch', label: 'Mismatch', description: 'The count and the stored digit differ, so the answer is false.' },
    { id: 'done', label: 'Complete', description: 'Report the result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digits as a JSON string',
  url: 'https://leetcode.com/problems/check-if-number-has-equal-digit-count-and-digit-value/',
  complexity: 'O(n^2) time for n digits; the visualization caps input at 10 digits.',
  examples: [
    { label: 'Example 1', input: '"1210"' },
    { label: 'Example 2', input: '"030"' },
  ],
}

export default function EqualDigitCountAndValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Number" length={run.input.length} valueAt={i => run.input[i]} active={step.index} roleAt={i => (i < step.index ? 'checked' : '')} />
    <output aria-label="Current check">{step.index < 0 ? 'No position checked yet' : `Digit ${step.index} appears ${step.count} times; position ${step.index} holds ${step.expected}`}</output>
  </>} renderReasoning={() => <>
    <p>Position i must hold the number of times the digit i appears in the whole string, so every position is a claim about the full string.</p>
    <p>Stopping at the first false claim is enough, because one wrong position already makes the number invalid.</p>
  </>} />
}
