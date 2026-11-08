import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SplitTreeView from './SplitTreeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3506',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with splitTime and strains (elimination times)',
  url: 'https://leetcode.com/problems/find-time-required-to-eliminate-bacterial-strains/',
  complexity: 'O(k log k) time and O(k) space for k strains: a min-heap holds the pool and each merge removes two entries and adds one. The visualization caps the input at 8 strains; this trace re-sorts a short list at each merge for clarity.',
  examples: [
    { label: 'Split pays off', input: '{"splitTime":2,"strains":[3,4,9]}' },
    { label: 'Single strain', input: '{"splitTime":5,"strains":[7]}' },
    { label: 'Balanced pair', input: '{"splitTime":1,"strains":[6,6,6,6]}' },
    { label: 'One strain, split at 1', input: '{"splitTime":1,"strains":[1]}' },
    { label: 'Equal times tie', input: '{"splitTime":5,"strains":[5,5,5]}' },
    { label: 'Largest limits', input: '{"splitTime":9,"strains":[9,1,9,1,9,1,9,1]}' },
    { label: 'Long run: 8 strains', input: '{"splitTime":4,"strains":[9,7,8,5,4,5,4,5]}' },
  ],
}

export default function FindTimeToEliminateBacterialStrainsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SplitTreeView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
