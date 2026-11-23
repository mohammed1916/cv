import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'

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
  question: "Reverse the digits of a number and add up the primes in the range between the two values.",
  approaches: [
    { name: "Trial division over the range", intuition: "Reverse the digits, then test each value in the range by trial division up to its square root.", time: "O(R x sqrt(R))", space: "O(1)" },
  ],
  examples: [
    { label: 'Example 1', input: '{"n":13}' },
    { label: 'Example 2', input: '{"n":10}' },
    { label: 'Example 3', input: '{"n":8}' },
    { label: 'Smallest n', input: '{"n":1}' },
    { label: 'Small n with equal split', input: '{"n":4}' },
    { label: 'Largest allowed n', input: '{"n":1000}' },
    { label: 'Long run: n = 720', input: '{"n":720}' },
  ],
}

export default function SumPrimesReverse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {step.low != null && step.high != null ? <AnswerRangeBar title="Range of numbers" min={0} max={Math.max(1, run.input.n)} low={step.low} high={step.high} /> : null}
    <output aria-label="Range">{`n = ${run.input.n}, reverse = ${step.r ?? '-'}, range = ${step.r === null || step.r === undefined ? '-' : `[${step.low}, ${step.high}]`}`}</output>
    <output aria-label="Current number">{`Checking: ${step.x ?? '-'}. Running total: ${step.total}.`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The reverse of n is computed once, and the range is the span between n and its reverse, in either order.</p>
    <p>The range never exceeds 1000 under the constraints, so testing each number for primality is fast enough.</p>
  </>} />
}
