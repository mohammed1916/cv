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
  inputLabel: "Object with nums (JSON), e.g. {\"nums\":[5,4,9,2,6,1]}",
  url: "https://leetcode.com/problems/sum-of-squares-of-special-elements/",
  complexity: "O(n) time and O(1) extra space. The visualization caps input at 30 values.",
  examples: [
  {
    "label": "Six values",
    "input": "{\"nums\":[5,4,9,2,6,1]}"
  }, {
    "label": "Three values",
    "input": "{\"nums\":[7,3,8]}"
  },
    { label: 'Single value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[9,9,9,9]}' },
    { label: 'Boundary: 30 values with 1 and 1000', input: '{"nums":[1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1]}' },
    { label: 'Long run: 30 values', input: '{"nums":[880,740,606,660,469,226,597,430,811,221,684,894,59,629,619,201,897,499,497,903,409,537,747,455,709,857,99,744,78,382]}' },
  ],
}

export default function SumOfSquaresOfSpecialElementsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (step.special.includes(i) ? 'divides n' : '')} />
    <output aria-label="Total">{`Total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
