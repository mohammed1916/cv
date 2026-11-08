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
    { label: "Single number", input: "\"7\"" },
    { label: "Negative division", input: "\"div(-9,-3)\"" },
    { label: "Deep nesting at 78 characters", input: "\"add(add(add(add(add(add(add(add(add(add(add(1,1),1),1),1),1),1),1),1),1),1),1)\"" },
    { label: "Long run: six operations", input: "\"mul(mul(sub(add(sub(sub(2,2),1),4),3),2),1)\"" },
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
