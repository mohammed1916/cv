import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the answer range from one to n times the smallest divisor.' },
    { id: 'probe', label: 'Probe', description: 'Count the divisible numbers up to the middle value.' },
    { id: 'done', label: 'Complete', description: 'Report the nth divisible number.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, a, b and c',
  url: 'https://leetcode.com/problems/ugly-number-iii/',
  complexity: 'O(log(n * min)) probes, each with constant-time inclusion-exclusion. The visualization caps each value at 20.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"a":2,"b":3,"c":5}' },
    { label: 'Example 2', input: '{"n":4,"a":2,"b":3,"c":4}' },
  ],
}

export default function UglyNumberThree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Search">{step.mid === null
      ? `Answer range ${step.low} to ${step.high} for n = ${run.input.n}, divisors ${run.input.a}, ${run.input.b}, ${run.input.c}`
      : `Range ${step.low} to ${step.high}, testing ${step.mid}: ${step.found} divisible numbers up to it, need ${run.input.n}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Inclusion-exclusion counts numbers divisible by at least one divisor, subtracting the overlaps of each pair and adding back the triple overlap.</p>
  </>} />
}
