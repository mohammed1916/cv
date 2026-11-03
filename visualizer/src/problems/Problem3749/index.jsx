import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ExpressionStackView from './ExpressionStackView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON string holding the expression (e.g. \"add(1,mul(2,-3))\")",
  url: "https://leetcode.com/problems/evaluate-valid-expressions/",
  complexity: "O(L) time for an expression of length L, with O(depth) recursion space. Division is exact, so integer division is safe. The visualization caps the text at 80 characters and writes it without spaces.",
  examples: [
    { label: "Nested product", input: "\"add(1,mul(2,-3))\"" },
    { label: "Exact division", input: "\"div(sub(10,4),3)\"" },
    { label: "Mixed operators", input: "\"sub(mul(-2,add(3,4)),div(12,-4))\"" },
  ],
}

export default function Problem3749Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ExpressionStackView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
