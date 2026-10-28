import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Read the digits of num.' },
    { id: 'count', label: 'Count digits', description: 'Tally how often each digit appears.' },
    { id: 'pair', label: 'Pairs', description: 'Build the outer half from pairs, largest digit first.' },
    { id: 'middle', label: 'Middle', description: 'Pick the largest digit with an odd count.' },
    { id: 'zeros', label: 'Zeros only', description: 'Handle a half made only of zeros.' },
    { id: 'build', label: 'Mirror', description: 'Mirror the half around the middle.' },
    { id: 'done', label: 'Complete', description: 'Report the largest palindrome.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String num of decimal digits (JSON object)',
  url: 'https://leetcode.com/problems/largest-palindromic-number/',
  complexity: 'O(n + 10) time for n digits. The visualization caps input at 30 digits.',
  examples: [
    { label: 'Mixed digits', input: '{"num":"444947137"}' },
    { label: 'Only zeros', input: '{"num":"00009"}' },
  ],
}

export default function LargestPalindromicNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { num } = run.input
    return <>
      <IndexedSequence label="Digits of num" length={num.length} valueAt={i => num[i]} active={step.index}
        roleAt={i => (step.index >= 0 && i <= step.index ? 'seen' : '')} />
      <FrequencyCountTable title="Digit counts" entries={step.counts} active={step.key} />
      <output aria-label="Half and middle">{`Half: ${step.half || '(empty)'}, middle: ${step.middle || '(none)'}${step.result ? `, answer: ${step.result}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A palindrome reads the same both ways, so each pair of equal digits can sit on opposite ends.</p>
    <p>Filling the outside from 9 down to 0 makes the number as large as possible, and one leftover digit with an odd count can go in the middle.</p>
  </>} />
}
