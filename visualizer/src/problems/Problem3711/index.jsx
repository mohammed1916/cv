import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TransactionBalanceView from './TransactionBalanceView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "List of signed integers (e.g. [-3,5,-4])",
  url: "https://leetcode.com/problems/maximum-transactions-without-negative-balance/",
  complexity: "O(n log n) time with a min-heap of kept negatives and O(n) space. The visualization caps the list at 14 transactions with amounts from -50 to 50.",
  examples: [
    { label: "Dip and recover", input: "[-3,5,-4,2,-6]" },
    { label: "Mixed run", input: "[4,-2,-5,3,-1,-4]" },
    { label: "All losses", input: "[-1,-1,-1]" },
    { label: 'Single gain', input: '[5]' },
    { label: 'Single loss', input: '[-4]' },
    { label: 'Zero changes', input: '[0,0,0]' },
    { label: 'Largest swings', input: '[50,-50,50,-50,50,-50,50,-50,50,-50,50,-50,50,-50]' },
    { label: 'Long run: 14 values', input: '[-8,33,34,-26,40,0,-15,-22,-49,-17,-10,-21,-5,-9]' },
  ],
}

export default function Problem3711Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TransactionBalanceView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
