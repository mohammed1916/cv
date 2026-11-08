import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SplitLadderView from './SplitLadderView'
import { buildTrace, parseInput, code, python } from './algorithm'

const phases = [
  { id: 'start', label: 'Base', description: 'One is already a single one.' },
  { id: 'row', label: 'Next x', description: 'Move to the next total.' },
  { id: 'try', label: 'Try split', description: 'Price one split of x.' },
  { id: 'keep', label: 'Keep', description: 'This split is the cheapest so far.' },
  { id: 'skip', label: 'Skip', description: 'This split is not cheaper.' },
  { id: 'done', label: 'Answer', description: 'The cost for n is known.' },
]

const definition = {
  number: '3958',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer n (for example 6)',
  url: 'https://leetcode.com/problems/minimum-cost-to-split-into-ones-ii/',
  complexity: 'O(n^2) time and O(n) space for the dynamic program over totals 1 to n. The visualization caps n at 40; the official bounds are not checked here.',
  examples: [
    { label: 'Six', input: '6' },
    { label: 'Nine', input: '9' },
    { label: 'One', input: '1' },
    { label: 'Smallest n plus one', input: '2' },
    { label: 'Small even n', input: '4' },
    { label: 'Largest allowed n', input: '40' },
    { label: 'Long run: n = 39', input: '39' },
  ],
}

export default function MinimumCostToSplitIntoOnesII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SplitLadderView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `The total cost for ${run.input.n} is ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
