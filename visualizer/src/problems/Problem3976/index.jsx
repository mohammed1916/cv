import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationSweepView from './OperationSweepView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the best total.' },
    { id: 'ends', label: 'Ends', description: 'Record the best sums ending and starting at each index.' },
    { id: 'proper', label: 'Proper', description: 'Score a subarray that leaves out one end.' },
    { id: 'op', label: 'Operation', description: 'Apply multiply or divide to the modified interval.' },
    { id: 'sweep', label: 'Sweep', description: 'Try each right end with the best left end so far.' },
    { id: 'done', label: 'Result', description: 'Report the best achievable subarray sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (e.g. {"nums":[-2,5,-3,4],"k":3})',
  url: 'https://leetcode.com/problems/maximum-subarray-sum-after-multiplier/',
  complexity: 'O(n) time after the prefix pass. This trace prints the sweep for every position, so it is O(n) on the small visual inputs too.',
  examples: [
    { label: 'Mixed signs', input: '{"nums":[-2,5,-3,4],"k":3}' },
    { label: 'Negative run', input: '{"nums":[-4,-1,-6,2],"k":2}' },
    { label: "Single value", input: '{"nums":[-3],"k":1}' },
    { label: "Equal values", input: '{"nums":[5,5,5],"k":2}' },
    { label: "Extremes with maximum k", input: '{"nums":[20,-20,20,-20,20,-20,20,-20],"k":20}' },
    { label: "Long run: 8 values", input: '{"nums":[11,17,-11,14,-10,1,-14,-10],"k":7}' },
  ],
}

export default function MaximumSubarraySumAfterMultiplier() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <OperationSweepView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>The scored subarray can extend beyond the modified interval, so each interval contributes its modified sum plus the best unmodified extension on each side. {step.message} {run ? `Best sum: ${run.result}.` : ''}</p>
  )} />
}
