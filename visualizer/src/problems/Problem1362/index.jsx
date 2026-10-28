import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Targets', description: 'The answer is a factor pair of num plus 1 or num plus 2.' },
    { id: 'search', label: 'Search', description: 'Find the divisor nearest the square root of the target.' },
    { id: 'done', label: 'Complete', description: 'Keep the pair with the smaller gap.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with num from 1 to 1000000000, for example {"num":8}',
  url: 'https://leetcode.com/problems/closest-divisors/',
  complexity: 'O(sqrt(num)) time for each of the two targets.',
  examples: [
    { label: 'Example 1', input: '{"num":8}' },
    { label: 'Example 2', input: '{"num":123}' },
  ],
}

export default function ClosestDivisors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Targets" length={run.targets.length} valueAt={index => run.targets[index]} roleAt={index => (step.pairs[index] ? `${step.pairs[index][0]} x ${step.pairs[index][1]}` : '')} active={step.pairs.length - 1} />
    <output aria-label="Pairs found">{`Pairs found: ${step.pairs.map(p => `${p[0]} x ${p[1]}`).join(', ') || 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>The closest factor pair of a number is the pair nearest its square root. Searching down from the square root finds it first.</p>
    <p>Only num plus 1 and num plus 2 need checking, since one of them is always a product of two integers close together.</p>
  </>} />
}
