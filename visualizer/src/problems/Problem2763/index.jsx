import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
  {
    "id": "setup",
    "label": "Setup",
    "description": "Set up the running total."
  },
  {
    "id": "start",
    "label": "Start",
    "description": "Begin subarrays at one start index."
  },
  {
    "id": "extend",
    "label": "Extend",
    "description": "Extend the subarray to the next end index."
  },
  {
    "id": "add",
    "label": "Add",
    "description": "Insert a new distinct value and update adjacent pairs."
  },
  {
    "id": "count",
    "label": "Count",
    "description": "Add the imbalance of the current subarray."
  },
  {
    "id": "done",
    "label": "Result",
    "description": "Report the total."
  }
],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with nums (JSON), e.g. {\"nums\":[2,3,1,4]}",
  url: "https://leetcode.com/problems/sum-of-imbalance-numbers-of-all-subarrays/",
  complexity: "O(n^2) distinct-count enumeration with set lookups. The visualization caps input at 20 values; the official limit is 1000.",
  examples: [
  {
    "label": "Example 1",
    "input": "{\"nums\":[2,3,1,4]}"
  },
  {
    "label": "Example 2",
    "input": "{\"nums\":[1,3,3,3,5]}"
  }
],
}

export default function SumImbalanceNumbersVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.j}
      roleAt={i => (step.window.length && i >= step.window[0] && i <= step.window[1] ? 'window' : '')} />
    <output aria-label="Running total">{`Subarray ${step.i}-${step.j}, distinct ${step.distinct}, adjacent pairs ${step.adjacent}, total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
