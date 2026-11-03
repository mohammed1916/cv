import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ElementChainView from './ElementChainView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "List of positive integers (e.g. [1,8,5,9])",
  url: "https://leetcode.com/problems/minimum-operations-to-make-the-array-beautiful/",
  complexity: "Dynamic search over candidate values: O(n times V squared) time in the simple form used here, where V is twice the largest input value, and O(V) space per layer. A greedy smallest-multiple choice is not enough, so every candidate keeps its cheapest chain. The visualization caps the array at 8 values of at most 20.",
  examples: [
    { label: "Expensive middle", input: "[1,8,5,9]" },
    { label: "Small chain", input: "[4,6,9]" },
    { label: "Mixed start", input: "[3,7,2,11]" },
  ],
}

export default function Problem3717Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ElementChainView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
