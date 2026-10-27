import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Shorter', description: 'Count the distinct-digit numbers with fewer digits than n.' },
    { id: 'digit', label: 'Digit', description: 'Walk the digits of n and count the smaller choices at each position.' },
    { id: 'done', label: 'Complete', description: 'Subtract the distinct count from n.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An integer n from 1 to 100000, for example 100',
  url: 'https://leetcode.com/problems/numbers-with-repeated-digits/',
  complexity: 'O(d * 10) time for d digits of n. The visualization caps n at 100000.',
  examples: [
    { label: 'Example 1', input: '20' },
    { label: 'Example 2', input: '100' },
  ],
}

export default function RepeatedDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of n" length={String(run.input).length} valueAt={index => String(run.input)[index]} active={step.index} />
    <output aria-label="Distinct count">{`Numbers with distinct digits so far: ${step.unique}`}</output>
  </>} renderReasoning={() => <>
    <p>It is easier to count the numbers whose digits are all distinct and subtract them from n.</p>
    <p>Shorter numbers are free to choose. For n itself, every smaller digit at a position opens a block of completions that can be counted in one multiplication.</p>
  </>} />
}
