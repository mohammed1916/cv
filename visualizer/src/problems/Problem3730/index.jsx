import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import JumpZigzagView from './JumpZigzagView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "List of block heights (e.g. [3,10,4,1])",
  url: "https://leetcode.com/problems/maximum-calories-burnt-from-jumps/",
  complexity: "O(n log n) time for the sort and O(n) for the alternating pass; O(n) space for the sorted copy. Reading used: the route starts on the ground at height zero and alternates highest and lowest. The visualization caps the list at 10 blocks of height 0 to 50.",
  examples: [
    { label: "Tall first", input: "[3,10,4,1]" },
    { label: "Repeated heights", input: "[0,7,7,2,5]" },
    { label: "Single block", input: "[6]" },
  ],
}

export default function Problem3730Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <JumpZigzagView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
