import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MinimumIndexSumView from './MinimumIndexSumView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Object with nums1 and nums2 (e.g. {\"nums1\":[7,3],\"nums2\":[3,7]})",
  url: "https://leetcode.com/problems/minimum-index-sum-of-common-elements/",
  complexity: "O(n + m) time with a hash map of first positions in nums2, plus O(k log k) to sort k answers; O(m) space. Reading used: first occurrences decide each value index sum, and every value at the smallest sum is returned in ascending order. The visualization caps each array at 10 values.",
  examples: [
    { label: "Unique minimum", input: "{\"nums1\":[7,3,9,4,1],\"nums2\":[4,8,1,3,6]}" },
    { label: "Four-way tie", input: "{\"nums1\":[6,1,4,9],\"nums2\":[9,4,1,6]}" },
    { label: "No common value", input: "{\"nums1\":[1,2],\"nums2\":[3,4]}" },
    { label: 'Single value each', input: '{"nums1":[0],"nums2":[0]}' },
    { label: 'Equal values', input: '{"nums1":[3,3],"nums2":[3,3]}' },
    { label: 'Largest values', input: '{"nums1":[99,99,99,99,99,99,99,99,99,99],"nums2":[99,0,99,0,99,0,99,0,99,0]}' },
    { label: 'Long run: 10 values each', input: '{"nums1":[98,55,37,98,58,3,6,94,9,92],"nums2":[7,53,29,42,17,23,52,73,43,76]}' },
  ],
}

export default function Problem3682Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MinimumIndexSumView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
