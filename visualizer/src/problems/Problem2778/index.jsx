import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
  {
    "id": "setup",
    "label": "Setup",
    "description": "Read the length and start the sum."
  },
  {
    "id": "scan",
    "label": "Scan",
    "description": "Visit each 1-indexed position."
  },
  {
    "id": "check",
    "label": "Check",
    "description": "Test whether the position divides n."
  },
  {
    "id": "add",
    "label": "Add",
    "description": "Add the square of a special element."
  },
  {
    "id": "done",
    "label": "Result",
    "description": "Report the sum."
  }
],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with nums (JSON), e.g. {\"nums\":[2,7,1,19,18,3]}",
  url: "https://leetcode.com/problems/sum-of-squares-of-special-elements/",
  complexity: "O(n) time and O(1) extra space. The visualization caps input at 30 values.",
  examples: [
  {
    "label": "Example 1",
    "input": "{\"nums\":[2,7,1,19,18,3]}"
  }
],
}

export default function SumOfSquaresOfSpecialElementsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (step.special.includes(i) ? 'window' : '')} />
    <output aria-label="Total">{`Total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
