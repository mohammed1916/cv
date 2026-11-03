import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FrequencyFilterView from './FrequencyFilterView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3662',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with s and k (e.g. {"s":"aabbc","k":2})',
  url: 'https://leetcode.com/problems/filter-characters-by-frequency/',
  complexity: 'O(n) time and O(1) extra space for a string of n lowercase letters, since there are at most 26 letters. The visualization caps s at 20 characters and k at 10; the official bounds are not verified here.',
  examples: [
    { label: 'Keep the rare letters', input: '{"s":"aabbc","k":2}' },
    { label: 'Everything survives', input: '{"s":"abcabc","k":3}' },
    { label: 'Nothing survives', input: '{"s":"aaa","k":3}' },
  ],
}

export default function Problem3662Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <FrequencyFilterView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
