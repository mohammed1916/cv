import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitQueueView from './DigitQueueView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Set up the allowed digits and the queue.' },
    { id: 'pop', label: 'Pop', description: 'Take the smallest unexamined number.' },
    { id: 'check', label: 'Check', description: 'Test it against k.' },
    { id: 'extend', label: 'Extend', description: 'Append each digit to the back of the queue.' },
    { id: 'found', label: 'Found', description: 'The first qualifying number is the answer.' },
    { id: 'done', label: 'Result', description: 'Report the answer or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with k, digit1 and digit2',
  url: 'https://leetcode.com/problems/smallest-greater-multiple-made-of-two-digits/',
  complexity: 'Time is bounded by the numbers up to 2147483647 built from two digits, about 2 to the power 11 candidates. Space is the queue of pending candidates. The visualization accepts k up to 1000000.',
  examples: [
    { label: 'Nines and twos', input: '{"k":7,"digit1":9,"digit2":2}' },
    { label: 'Zero and eight', input: '{"k":11,"digit1":0,"digit2":8}' },
    { label: 'Coinciding digits', input: '{"k":6,"digit1":3,"digit2":3}' },
  ],
}

export default function SmallestGreaterMultipleTwoDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DigitQueueView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Candidates are built by appending digits in ascending order, so the queue always holds numbers from smallest to largest. The first multiple of k above k is therefore the first one the queue produces.</p>
  </>} />
}
