import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
  {
    "id": "setup",
    "label": "Setup",
    "description": "Take n as the largest value."
  },
  {
    "id": "length",
    "label": "Length",
    "description": "Check the length is n + 1."
  },
  {
    "id": "count",
    "label": "Count",
    "description": "Count how often each value appears."
  },
  {
    "id": "verify",
    "label": "Verify",
    "description": "Check each value from 1 to n - 1 appears once."
  },
  {
    "id": "done",
    "label": "Result",
    "description": "Report whether the array is good."
  }
],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with nums (JSON), e.g. {\"nums\":[1,3,3,2]}",
  url: "https://leetcode.com/problems/check-if-array-is-good/",
  complexity: "O(n) time and O(n) space for the count array. The visualization caps input at 30 values.",
  examples: [
  {
    "label": "Example 1",
    "input": "{\"nums\":[2,1,3]}"
  },
  {
    "label": "Example 2",
    "input": "{\"nums\":[1,3,3,2]}"
  }
],
}

export default function CheckIfArrayIsGoodVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Counts for values 0 to n" length={step.n + 1} valueAt={i => step.count[i] ?? 0} active={step.index}
      roleAt={i => (i === step.index ? 'window' : '')} />
    <output aria-label="Largest value">{`n = ${step.n}`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
