import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty window and an empty deque.' },
    { id: 'extend', label: 'Extend', description: 'Add the next robot to the window and the deque.' },
    { id: 'shrink', label: 'Shrink', description: 'Drop the leftmost robot while the window is over budget.' },
    { id: 'record', label: 'Record', description: 'Keep the largest window size seen so far.' },
    { id: 'done', label: 'Complete', description: 'Report the largest number of robots that fit.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with charge_times, running_costs and budget',
  url: 'https://leetcode.com/problems/maximum-number-of-robots-within-budget/',
  complexity: 'O(n) time with a monotonic deque. The visualization caps input at 12 robots.',
  examples: [
    { label: 'Example 1', input: '{"charge_times":[3,6,1,3,4],"running_costs":[2,1,3,4,5],"budget":25}' },
    { label: 'No robot fits', input: '{"charge_times":[11,12,19],"running_costs":[10,8,7],"budget":19}' },
  ],
}

export default function MaximumRobotsWithinBudget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Charge times" length={run.input.charge_times.length} valueAt={i => run.input.charge_times[i]}
      active={step.r} roleAt={i => (i >= step.l && i <= step.r ? 'window' : '')} />
    <output aria-label="Window">{`Window ${step.l} to ${step.r}, cost ${step.cost}, best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The deque keeps robots whose charge times decrease, so its front always holds the maximum charge in the window.</p>
  </>} />
}
