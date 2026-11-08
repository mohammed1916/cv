import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
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
    { label: 'Own case 1', input: '{"n":4,"a":3,"b":4,"c":6}' },
    { label: 'Own case 2', input: '{"n":5,"a":3,"b":4,"c":5}' },
    { label: 'Every number divisible by one', input: '{\"n\":1,\"a\":1,\"b\":1,\"c\":1}' },
    { label: 'Equal divisors, no overlap to remove', input: '{\"n\":10,\"a\":4,\"b\":4,\"c\":4}' },
    { label: 'Largest allowed values', input: '{\"n\":20,\"a\":20,\"b\":20,\"c\":20}' },
    { label: 'Long run: largest n with small divisors', input: '{\"n\":20,\"a\":2,\"b\":3,\"c\":5}' },
  ],
}

export default function UglyNumberThree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, a, b, c } = run.input
    const max = n * Math.min(a, b, c)
    return <>
      <AnswerRangeBar title="Answer search" min={1} max={max} low={step.low} high={step.high} probe={step.mid} verdict={step.found !== null && step.found >= n} />
      <output aria-label="Search">{step.mid === null
        ? `lo = ${step.low}, hi = ${step.high}. The answer is the ${n}th number divisible by ${a}, ${b} or ${c}.`
        : `lo = ${step.low}, hi = ${step.high}, mid = ${step.mid}: ${step.found} numbers up to mid, need ${n}.`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Inclusion-exclusion counts numbers divisible by at least one divisor, subtracting the overlaps of each pair and adding back the triple overlap.</p>
  </>} />
}
