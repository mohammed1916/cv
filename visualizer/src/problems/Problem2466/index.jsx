import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty string', description: 'There is one way to build the empty string.' },
    { id: 'length', label: 'Length', description: 'Add the ways from the lengths one zero block and one one block shorter.' },
    { id: 'done', label: 'Complete', description: 'Sum the ways for every length in the range.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with low, high, zero, and one (JSON)',
  url: 'https://leetcode.com/problems/count-ways-to-build-good-strings/',
  complexity: 'O(high) time and O(high) space. The visualization caps high at 14.',
  examples: [
    { label: 'Example 1', input: '{"low":3,"high":3,"zero":1,"one":1}' },
    { label: 'Example 2', input: '{"low":2,"high":3,"zero":1,"one":2}' },
  ],
}

export default function CountGoodStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Ways by length" length={run.input.high + 1} valueAt={i => step.ways[i]}
      active={step.length} roleAt={i => (i >= run.input.low && i <= run.input.high ? 'counted' : '')} />
    <output aria-label="Total">{step.phase === 'done' ? `Answer: ${run.result}` : `Length ${step.length} of ${run.input.high}`}</output>
  </>} renderReasoning={() => <>
    <p>Every good string is built by appending a block of zero zeros or a block of one ones, so each length is the sum of two shorter lengths.</p>
    <p>The answer adds up the counts for every length from low to high.</p>
  </>} />
}
