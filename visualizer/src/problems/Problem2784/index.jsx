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
  inputLabel: "Object with nums (JSON), e.g. {\"nums\":[2,2,3,1]}",
  url: "https://leetcode.com/problems/check-if-array-is-good/",
  complexity: "O(n) time and O(n) space for the count array. The visualization caps input at 30 values.",
  examples: [
  {
    "label": "Good array",
    "input": "{\"nums\":[3,1,4,4,2]}"
  },
  {
    "label": "Repeated middle value",
    "input": "{\"nums\":[2,2,3,1]}"
  },
    { label: 'Single value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[4,4,4,4]}' },
    { label: 'Boundary: 1 and 30 alternating', input: '{"nums":[1,30,1,30,1,30,1,30,1,30,1,30,1,30,1,30,1,30,1,30,1,30,1,30,1,30,1,30,1,30]}' },
    { label: 'Long run: 30 values', input: '{"nums":[16,18,21,29,29,4,3,23,1,17,30,21,27,13,11,28,3,20,10,26,3,8,11,22,23,14,9,12,22,5]}' },
  ],
}

export default function CheckIfArrayIsGoodVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Counts for values 0 to n" length={step.n + 1} valueAt={i => step.count[i] ?? 0} active={step.index}
      roleAt={i => (i === step.index ? 'window' : '')} />
    <output aria-label="Largest value">{`n = ${step.n}`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
