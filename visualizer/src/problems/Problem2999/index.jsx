import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Check that every digit of s fits the limit.' },
    { id: 'upper', label: 'Upper bound', description: 'Count valid numbers up to finish.' },
    { id: 'lower', label: 'Lower bound', description: 'Count valid numbers up to start - 1.' },
    { id: 'done', label: 'Complete', description: 'Subtract the two counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: start, finish and s (digit strings), limit (1-9)',
  url: 'https://leetcode.com/problems/count-the-number-of-powerful-integers/',
  complexity: 'O(d) time per bound, where d is the number of digits. The visualization caps finish at 100000.',
  examples: [
    { label: 'Example 1', input: '{"start":"1","finish":"6000","limit":4,"s":"124"}' },
    { label: 'No match', input: '{"start":"1000","finish":"2000","limit":4,"s":"3000"}' },
  ],
}

export default function PowerfulIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Bound">{step.bound === null ? 'Checking digits' : `Bound ${step.bound}: ${step.count} valid numbers`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A powerful integer is some prefix followed by s, so each bound reduces to counting prefixes with digits at most the limit.</p>
  </>} />
}
