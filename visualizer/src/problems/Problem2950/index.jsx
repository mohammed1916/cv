import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WeightRunView from './WeightRunView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No substring has been counted yet.' },
    { id: 'average', label: 'Average q', description: 'Fix the average weight to test.' },
    { id: 'count', label: 'Count', description: 'Match this running value against earlier ones.' },
    { id: 'done', label: 'Result', description: 'Report the number of divisible substrings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a lowercase word, e.g. {"word":"kitchen"}',
  url: 'https://leetcode.com/problems/number-of-divisible-substrings/',
  complexity: 'O(9 n) time and O(n) space: each of the nine averages is one pass with a hash map of running values. The visualization caps the word at 30 letters.',
  examples: [
    { label: 'Mixed letters', input: '{"word":"kitchen"}' },
    { label: 'Repeated letter', input: '{"word":"aaaa"}' },
  ],
}

export default function NumberOfDivisibleSubstrings() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <WeightRunView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Subtracting the average from each weight turns the test into a zero-sum check, which a running total with a hash map answers in one pass.</p>
    </>} />
}
