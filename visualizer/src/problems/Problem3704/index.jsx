import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with one state: carry 0, both addends running.' },
    { id: 'digit', label: 'Digit', description: 'Place a digit for each addend and keep the choices that match n.' },
    { id: 'done', label: 'Complete', description: 'Count the states that end with no carry.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An integer n from 2 to 1000000, for example 11',
  url: 'https://leetcode.com/problems/count-no-zero-pairs-that-sum-to-n/',
  complexity: 'O(d * 10 * 10) time for d digits of n with a small set of states. The visualization caps n at 1000000.',
  examples: [
    { label: 'Example 1', input: '2' },
    { label: 'Example 2', input: '11' },
  ],
}

export default function CountNoZeroPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of n (ones place first)" length={String(run.input).length}
      valueAt={index => String(run.input).split('').reverse()[index]} active={step.position} />
    <output aria-label="State count">{step.total === null ? `Live states: ${step.states}` : `Pairs with no zero digits: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Both addends are built one digit place at a time, from the ones place upward, so the carry between places is tracked explicitly.</p>
    <p>An addend may end at any place after its first. Once it ends, its remaining digits are zero, so it stops contributing.</p>
  </>} />
}
