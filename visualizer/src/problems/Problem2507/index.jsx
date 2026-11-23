import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import ChainFactorView from './ChainFactorView'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with n.' },
    { id: 'replace', label: 'Replace', description: 'Replace the value with the sum of its prime factors.' },
    { id: 'fixed', label: 'Fixed', description: 'The value no longer changes.' },
    { id: 'done', label: 'Complete', description: 'Report the settled value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (JSON), from 2 to 1000',
  url: 'https://leetcode.com/problems/smallest-value-after-replacing-with-sum-of-prime-factors/',
  complexity: 'O(sqrt(n)) per step, and the number of steps is small for n up to 10^5. The visualization caps input at 1000.',
  question: "Replace n with the sum of its prime factors until the value stops changing, and return the final value.",
  approaches: [
    { name: "Trial division each step", intuition: "Factor the current value by trial division, replace it with the sum, and repeat.", time: "O(sqrt(n)) per step", space: "O(1)" },
  ],
  examples: [
    { label: 'Example 1', input: '{"n":15}' },
    { label: 'Example 2', input: '{"n":3}' },
    { label: 'Smallest n', input: '{"n":2}' },
    { label: 'Square of a prime', input: '{"n":4}' },
    { label: 'Largest n', input: '{"n":1000}' },
    { label: 'Long run: prime near 1000', input: '{"n":997}' },
  ],
}

export default function SmallestAfterReplacing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <ChainFactorView step={step} />} renderReasoning={() => <>
    <p>Replacing a number with the sum of its prime factors never increases it, and a fixed point is reached quickly.</p>
    <p>Each step is a trial-division factorization, so the loop only needs to track the current value and stop when it stops changing.</p>
  </>} />
}
