import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Prefix data', description: 'Precompute digit sums and scaled residues modulo 7.' },
    { id: 'count', label: 'Count ends', description: 'For each end digit, count the start positions that divide it.' },
    { id: 'skip', label: 'Zero digit', description: 'A zero digit is never a valid last digit.' },
    { id: 'done', label: 'Result', description: 'Report the total count.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Digit string JSON with s',
  url: 'https://leetcode.com/problems/count-substrings-divisible-by-last-digit/',
  complexity: 'O(n) time and O(1) extra space for n digits, using residue counters. The visualization caps s at 20 digits.',
  examples: [
    { label: 'Example 1', input: '{"s":"12936"}' },
    { label: 'Example 2', input: '{"s":"5701283"}' },
    { label: 'Example 3', input: '{"s":"1010101010"}' },
  ],
}

export default function CountSubstringsDivisibleByLastDigit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Digits (active = end position)" length={step.digits.length} valueAt={index => step.digits[index]}
      active={step.r} roleAt={index => (step.counted[index] !== null && index <= step.r ? `+${step.counted[index]}` : '')} />
    <p>{step.count === null ? 'Choosing the next end position' : `Substrings ending here: ${step.count}`} · Total {step.total}</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The divisibility test for each last digit depends only on a few summaries of the prefix, so each end position is counted without listing every substring.</p>
  </>} />
}
