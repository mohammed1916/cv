import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Find the sum of every number from 1 to n.' },
    { id: 'count', label: 'Multiples', description: 'Find how many multiples of m there are, and their sum.' },
    { id: 'done', label: 'Complete', description: 'Subtract twice the multiples from the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n and m, each from 1 to 1000, for example {"n":10,"m":3}',
  url: 'https://leetcode.com/problems/divisible-and-non-divisible-sums-difference/',
  complexity: 'O(1) time with the closed form. The visualization shows up to 1000 numbers.',
  examples: [
    { label: 'Example 1', input: '{"n":10,"m":3}' },
    { label: 'No multiples', input: '{"n":5,"m":6}' },
  ],
}

export default function DivisibleDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers from 1 to n" length={run.input.n} valueAt={index => index + 1} roleAt={index => ((index + 1) % run.input.m === 0 ? 'multiple' : 'kept')} active={-1} />
    <output aria-label="Multiples">{`Multiples of ${run.input.m} so far: ${step.k}, sum ${step.multiples}`}</output>
  </>} renderReasoning={() => <>
    <p>Let total be the sum of 1 to n. The non-divisible sum is total minus the divisible sum, so the difference is total minus twice the divisible sum.</p>
    <p>The multiples of m are m, 2m, up to k times m, where k is n divided by m, so their sum is m times k times k plus one over two.</p>
  </>} />
}
