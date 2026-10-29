import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
  {
    "id": "setup",
    "label": "Setup",
    "description": "Start the count at 0."
  },
  {
    "id": "scan",
    "label": "Scan",
    "description": "Read each employee's hours."
  },
  {
    "id": "check",
    "label": "Check",
    "description": "Compare hours with the target."
  },
  {
    "id": "count",
    "label": "Count",
    "description": "Count an employee who met the target."
  },
  {
    "id": "done",
    "label": "Result",
    "description": "Report the count."
  }
],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with hours and target (JSON), e.g. {\"hours\":[0,1,2,3,4],\"target\":2}",
  url: "https://leetcode.com/problems/number-of-employees-who-met-the-target/",
  complexity: "O(n) time and O(1) space for n employees. The visualization caps input at 50 employees, the official limit.",
  examples: [
  {
    "label": "Example 1",
    "input": "{\"hours\":[0,1,2,3,4],\"target\":2}"
  },
  {
    "label": "Example 2",
    "input": "{\"hours\":[5,1,4,2,2],\"target\":6}"
  }
],
}

export default function NumberOfEmployeesWhoMetTheTargetVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Hours worked" length={run.input.hours.length} valueAt={i => run.input.hours[i]} active={step.index}
      roleAt={i => (i === step.index ? 'window' : '')} />
    <output aria-label="Count">{`Target ${step.target}, count ${step.count}`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
