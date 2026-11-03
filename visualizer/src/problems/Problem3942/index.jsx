import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ArrangementView from './ArrangementView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3942',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array holding each value from 0 to n minus 1 once (n up to 8)',
  url: 'https://leetcode.com/problems/minimum-operations-to-sort-a-permutation/',
  complexity: 'O(n) states per breadth-first level in this direct form, with at most 2n reachable arrangements. The visualization caps the permutation at 8 values.',
  examples: [
    { label: 'Rotated', input: '[2, 3, 0, 1]' },
    { label: 'Impossible', input: '[0, 2, 1, 3]' },
  ],
}

export default function Problem3942Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ArrangementView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
