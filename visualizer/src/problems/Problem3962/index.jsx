import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SwapWindowView from './SwapWindowView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the best total.' },
    { id: 'window', label: 'Window', description: 'Sum the window before any swap.' },
    { id: 'swap', label: 'Swap', description: 'Pull the largest outside values in for the smallest inside values.' },
    { id: 'record', label: 'Record', description: 'Keep the best window total.' },
    { id: 'done', label: 'Result', description: 'Report the best subarray sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (e.g. {"nums":[-3,4,-1,5],"k":1})',
  url: 'https://leetcode.com/problems/maximum-subarray-sum-after-at-most-k-swaps/',
  complexity: 'O(n^3 log n) for this trace, which sorts for every window. The official limit is 1500 values.',
  examples: [
    { label: 'One swap', input: '{"nums":[-3,4,-1,5],"k":1}' },
    { label: 'Two swaps', input: '{"nums":[2,-7,-4,6,-1],"k":2}' },
    { label: "Single value", input: '{"nums":[-5],"k":1}' },
    { label: "Equal values with one swap", input: '{"nums":[4,4,-2,4],"k":1}' },
    { label: "Extreme values at both limits", input: '{"nums":[20,-20,20,-20,20,-20,20,-20,20,-20],"k":5}' },
    { label: "Long run: 10 values", input: '{"nums":[11,6,5,-7,17,-18,-16,-3,-19,-13],"k":4}' },
  ],
}

export default function MaximumSubarraySumAfterAtMostKSwaps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SwapWindowView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>
      Swaps only help when a large value from outside the window replaces a small value inside it, so each window pairs its smallest values with the largest outside values. {step.message} {run ? `Best sum: ${run.result}.` : ''}
    </p>
  )} />
}
