import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
  {
    "id": "setup",
    "label": "Setup",
    "description": "Find the smallest and largest values."
  },
  {
    "id": "scan",
    "label": "Scan",
    "description": "Visit each value in order."
  },
  {
    "id": "check",
    "label": "Check",
    "description": "Test whether the value is neither extreme."
  },
  {
    "id": "done",
    "label": "Result",
    "description": "Report the value found or -1."
  }
],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with nums (JSON), e.g. {\"nums\":[3,2,1,4]}",
  url: "https://leetcode.com/problems/neither-minimum-nor-maximum/",
  complexity: "O(n) time and O(1) extra space. The visualization caps input at 100 values, the official limit.",
  examples: [
  {
    "label": "Example 1",
    "input": "{\"nums\":[3,2,1,4]}"
  },
  {
    "label": "Example 2",
    "input": "{\"nums\":[1,2]}"
  },
  {
    "label": "Example 3",
    "input": "{\"nums\":[2,1,3]}"
  }
],
}

export default function NeitherMinimumNorMaximumVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i === step.index ? 'window' : '')} />
    <output aria-label="Extremes">{`Minimum ${step.lo}, maximum ${step.hi ?? '-'}`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
