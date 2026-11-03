import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GcdGroupsView from './GcdGroupsView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a best product of zero.' },
    { id: 'extend', label: 'Extend', description: 'Extend every group by the next number.' },
    { id: 'short', label: 'Too short', description: 'This group leaves fewer than k numbers.' },
    { id: 'candidate', label: 'Candidate', description: 'Score this group as a subarray.' },
    { id: 'best', label: 'Best', description: 'This candidate beats the best so far.' },
    { id: 'done', label: 'Result', description: 'Report the maximum product.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k, e.g. {"nums":[3,6,9,4,8],"k":2}',
  url: 'https://leetcode.com/problems/maximum-gcd-sum-of-a-subarray/',
  complexity: 'O(n log M) time and O(log M) extra space, where M is the largest value, because each right end keeps at most about log M distinct gcds. The visualization caps the array at 10 entries with values up to 60. Numbers are read as positive integers, so the earliest start for a gcd gives the largest sum.',
  examples: [
    { label: 'Mixed', input: '{"nums":[3,6,9,4,8],"k":2}' },
    { label: 'Single', input: '{"nums":[5],"k":1}' },
  ],
}

export default function MaximumGcdSumOfASubarray() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <GcdGroupsView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each group is one gcd value with its earliest start, so every right end is scored in a handful of steps instead of trying all starts.</p>
    </>} />
}
