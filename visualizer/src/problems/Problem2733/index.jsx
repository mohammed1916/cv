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
    "input": "{\"nums\":[4,7,5,9,6]}"
  },
  {
    "label": "Example 2",
    "input": "{\"nums\":[8,3]}"
  },
  {
    "label": "Example 3",
    "input": "{\"nums\":[9,5,6,1,8]}"
  },
  { label: 'Single value', input: '{"nums":[42]}' },
  { label: 'Two values reversed', input: '{"nums":[9,4]}' },
  { label: 'Largest value', input: '{"nums":[100,1]}' },
  { label: 'Long run: 60 values', input: '{"nums":[39,64,93,38,3,88,41,6,95,60,85,54,44,58,9,66,76,49,22,83,40,45,14,31,16,21,2,91,80,17,32,5,94,59,53,78,15,56,73,26,10,75,52,25,92,37,98,47,4,69,90,19,7,68,11,96,34,57,63,20]}' },
],
}

export default function NeitherMinimumNorMaximumVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i === step.index ? 'window' : '')} />
    <output aria-label="Extremes">{`Minimum ${step.lo}, maximum ${step.hi ?? '-'}`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
