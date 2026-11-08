import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ThresholdPickView from './ThresholdPickView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Object with nums and threshold (e.g. {\"nums\":[3,8],\"threshold\":[1,2]})",
  url: "https://leetcode.com/problems/maximum-total-sum-with-threshold-constraints/",
  complexity: "O(n squared) time in this direct form: each step scans all indexes, and each pick is a heap or sorted choice; O(n) space. The visualization caps n at 10 with values from -20 to 20.",
  examples: [
    { label: "Negative pick forced", input: "{\"nums\":[5,-2,9,4],\"threshold\":[1,3,2,1]}" },
    { label: "Two early picks", input: "{\"nums\":[3,8,1],\"threshold\":[1,1,3]}" },
    { label: "Late unlock", input: "{\"nums\":[7,14,-4,12],\"threshold\":[2,2,1,2]}" },
    { label: "Single value", input: "{\"nums\":[4],\"threshold\":[1]}" },
    { label: "Equal values", input: "{\"nums\":[5,5,5],\"threshold\":[1,2,3]}" },
    { label: "Extremes with rising thresholds", input: "{\"nums\":[20,-20,20,-20,20,-20,20,-20,20,-20],\"threshold\":[1,2,3,4,5,6,7,8,9,10]}" },
    { label: "Long run: 10 values", input: "{\"nums\":[-16,-12,-4,-10,-19,20,-4,11,-6,-12],\"threshold\":[6,1,7,8,1,6,1,9,8,2]}" },
  ],
}

export default function Problem3763Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ThresholdPickView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
