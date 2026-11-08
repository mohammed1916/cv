import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2231',
  phases: [
    { id: 'pools', label: 'Pools', description: 'Sort the odd digits and the even digits separately, largest first.' },
    { id: 'place', label: 'Place', description: 'Each position takes the largest unused digit of its own parity.' },
    { id: 'done', label: 'Result', description: 'Read the placed digits back as the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"num": 2736}',
  url: 'https://leetcode.com/problems/largest-number-after-digit-swaps-by-parity/',
  complexity: 'O(d log d) time and O(d) space for d digits. Swaps keep every digit in its parity class, so the pools decide the answer.',
  examples: [
    { label: 'Mixed', input: '{"num":2736}' },
    { label: 'Zero digit', input: '{"num":9083}' },
    { label: 'Smallest number', input: '{"num":1}' },
    { label: 'All same digits', input: '{"num":7777}' },
    { label: 'Largest number', input: '{"num":999999999}' },
  ],
}

export default function LargestAfterParitySwaps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="digits" length={step.digits.length} valueAt={i => step.digits[i]} active={step.at}
      roleAt={i => (step.digits[i] % 2 === 1 ? 'odd' : 'even')} />
    <IndexedSequence label="answer so far" length={step.digits.length} valueAt={i => step.out[i] ?? '_'} active={step.out.length - 1}
      roleAt={i => (i < step.out.length ? 'placed' : '')} />
    <p aria-label="Odd pool">{`Odd pool, largest first: ${step.odd.join(' ') || 'empty'}`}</p>
    <p aria-label="Even pool">{`Even pool, largest first: ${step.even.join(' ') || 'empty'}`}</p>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A swap may only exchange two digits of the same parity, so each odd digit stays on an odd digit's place class and each even digit on an even one.</p>
    <p>Within each class any order is reachable. The largest value is therefore reached by placing the largest remaining digit of the matching parity at every position, from left to right.</p>
  </>} />
}
