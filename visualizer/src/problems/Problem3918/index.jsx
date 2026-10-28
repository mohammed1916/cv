import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Reverse', description: 'Reverse the digits of n.' },
    { id: 'range', label: 'Range', description: 'Take the range between n and its reverse.' },
    { id: 'scan', label: 'Test', description: 'Check whether this number is prime.' },
    { id: 'prime', label: 'Add', description: 'A prime is added to the running total.' },
    { id: 'done', label: 'Return', description: 'The running total is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"n": n}',
  url: 'https://leetcode.com/problems/sum-of-primes-between-number-and-its-reverse/',
  complexity: 'O(R * sqrt(R)) time with R at most 1000 for trial division, and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"n":13}' },
    { label: 'Example 2', input: '{"n":10}' },
    { label: 'Example 3', input: '{"n":8}' },
  ],
}

export default function SumPrimesReverse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Range">{`n = ${run.input.n}, reverse = ${step.r ?? '-'}, range = ${step.r === null || step.r === undefined ? '-' : `[${step.low}, ${step.high}]`}`}</output>
    <output aria-label="Current number">{`Checking: ${step.x ?? '-'}. Running total: ${step.total}.`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The reverse of n is computed once, and the range is the span between n and its reverse, in either order.</p>
    <p>The range never exceeds 1000 under the constraints, so testing each number for primality is fast enough.</p>
  </>} />
}
