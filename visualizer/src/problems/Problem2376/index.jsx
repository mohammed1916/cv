import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Shorter', description: 'Count the distinct-digit numbers with fewer digits than n.' },
    { id: 'digit', label: 'Digit', description: 'Walk the digits of n and count the smaller choices at each position.' },
    { id: 'done', label: 'Complete', description: 'Report the count of special integers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An integer n from 1 to 100000, for example 135',
  url: 'https://leetcode.com/problems/count-special-integers/',
  complexity: 'O(d * 10) time for d digits of n. The visualization caps n at 100000.',
  examples: [
    { label: 'Example 1', input: '20' },
    { label: 'Example 2', input: '135' },
  ],
}

export default function SpecialIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of n" length={String(run.input).length} valueAt={index => String(run.input)[index]} active={step.index} />
    <output aria-label="Special count">{`Special integers so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>A special integer has no repeated digit. Shorter numbers can be counted with simple arithmetic, since every position after the first is an ordered choice of unused digits.</p>
    <p>For n itself, each smaller digit at a position leaves a block of completions, and the walk stops at the first repeated digit of n.</p>
  </>} />
}
