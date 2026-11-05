import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DecompView from './DecompView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1933',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Digit string (e.g. 11122)',
  url: 'https://leetcode.com/problems/check-if-string-is-decomposable-into-value-equal-substrings/',
  complexity: 'O(n) time and O(n) space with a fixed two-column reach table. The visualization caps the string at 20 digits;',
  examples: [
    { label: 'Decomposable', input: '77788' },
    { label: 'Two 2-blocks', input: '2222' },
    { label: 'No 2-block', input: '111222333' },
  ],
}

export default function Problem1933Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DecompView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
