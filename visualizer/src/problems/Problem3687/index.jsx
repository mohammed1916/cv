import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LateFeeView from './LateFeeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "List of late-day counts (e.g. [1,4,9])",
  url: "https://leetcode.com/problems/library-late-fee-calculator/",
  complexity: "O(n) time and O(1) extra space for n books. The visualization caps the list at 12 books, each from 1 to 60 days late.",
  examples: [
    { label: "One book in each tier", input: "[1,4,9]" },
    { label: "Long overdue books", input: "[12,3,1,5]" },
    { label: "Boundary days", input: "[5,6,2,1]" },
    { label: 'Single book', input: '[1]' },
    { label: 'Equal late counts', input: '[7,7,7]' },
    { label: 'Largest late counts', input: '[60,59,60]' },
    { label: 'No late books', input: '[]' },
    { label: 'Long run: 12 books', input: '[43,14,57,40,23,58,25,44,35,30,37,36]' },
  ],
}

export default function Problem3687Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LateFeeView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
