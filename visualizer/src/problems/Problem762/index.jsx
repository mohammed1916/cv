import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Prime set', description: 'Fix the small prime set of possible bit counts.' },
    { id: 'count', label: 'Count bits', description: 'Count the 1 bits of the current number.' },
    { id: 'test', label: 'Test prime', description: 'Check whether the bit count is prime and count the number.' },
    { id: 'done', label: 'Complete', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: '[left, right] (JSON)',
  url: 'https://leetcode.com/problems/prime-number-of-set-bits-in-binary-representation/',
  complexity: 'O(right - left) numbers, each with a popcount; the visualization caps the range width at 200.',
  examples: [
    { label: 'Example 1', input: '[6, 10]' },
    { label: 'Example 2', input: '[10, 15]' },
    { label: 'Wider range', input: '[1, 40]' },
  ],
}

export default function PrimeSetBits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const shown = Math.max(0, step.index + 1)
    return <>
      <IndexedSequence label="Numbers" length={run.numbers.length} active={step.index} indexOffset={run.input.left} valueAt={i => run.numbers[i]} roleAt={i => i >= shown ? '' : (run.bitsOf[i] && [2, 3, 5, 7, 11, 13, 17, 19].includes(run.bitsOf[i]) ? 'prime' : 'skipped')} />
      <output aria-label="Current number">{step.binary ? `${run.numbers[step.index]} = ${step.binary} (${step.bits} set bits${step.isPrime === null ? '' : step.isPrime ? ', prime' : ', not prime'})` : 'No number yet'}</output>
      <output aria-label="Count">Count so far: {step.count}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>Counting a number of set bits needs only a membership test, because a 20-bit number has at most 20 ones.</p>
    {step.bits !== null && <p>Bit count {step.bits}: {step.isPrime === null ? 'about to be tested' : step.isPrime ? 'prime, counted' : 'not prime, skipped'}.</p>}
  </>} />
}
