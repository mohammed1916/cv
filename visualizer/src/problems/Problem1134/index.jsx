import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an integer n (JSON)',
  url: 'https://leetcode.com/problems/armstrong-number/',
  complexity: 'O(d) time for d digits and O(d) extra space for the digits. The visualization accepts n up to 100000000.',
  examples: [
    { label: 'Three digits', input: '{"n":153}' },
    { label: 'Not Armstrong', input: '{"n":10}' },
    { label: 'Four digits', input: '{"n":9474}' },
  ],
}

export default function ArmstrongNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { digits, k, total, n, current } = step.snapshot
    const pointers = current === null || current === undefined ? {} : { digit: current }
    return <>
      <Sequence label={`Digits of ${n}, each raised to the power ${k}`} values={digits} pointers={pointers} />
      <Vars vars={{ 'digit count k': k, 'running total': total, n }} />
      <output aria-label="Result">{step.message}</output>
    </>
  }} renderReasoning={() => <p>An Armstrong number equals the sum of its digits, each raised to the number of digits. The running total is compared with n once every digit has been added.</p>} />
}
