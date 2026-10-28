import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Base cases', description: 'Zero or one plot: the first two counts.' },
    { id: 'extend', label: 'Extend', description: 'Each count is the sum of the two before it.' },
    { id: 'done', label: 'Square', description: 'The two sides of the street are independent.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Number of plots on one side (integer 1 to 60)',
  url: 'https://leetcode.com/problems/count-number-of-ways-to-place-houses/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 60 plots.',
  examples: [
    { label: 'One plot', input: '1' },
    { label: 'Three plots', input: '3' },
  ],
}

export default function PlaceHouses() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Arrangements on one side, by plot count" length={step.ways.length} valueAt={index => step.ways[index]} active={step.i} />
    <output aria-label="Step">{step.message}</output>
    {step.phase === 'done' && <output aria-label="Answer">Answer: {run.result}</output>}
  </>} renderReasoning={() => <>
    <p>Houses can sit on plots that are not next to each other, so a side with i plots has a Fibonacci-style count.</p>
    <p>Both sides of the street are independent, so the total is the single-side count squared.</p>
  </>} />
}
