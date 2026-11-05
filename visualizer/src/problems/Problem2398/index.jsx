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
    { label: 'Sliding window', input: '{"charge_times":[4,2,7,5,1],"running_costs":[1,3,2,2,6],"budget":24}' },
    { label: 'No robot fits', input: '{"charge_times":[11,12,19],"running_costs":[10,8,7],"budget":19}' },
  ],
}

export default function MaximumRobotsWithinBudget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Charge times" length={run.input.charge_times.length} valueAt={i => run.input.charge_times[i]}
      active={step.r} roleAt={i => (i === step.l && i === step.r ? 'l = r' : i === step.l ? 'l' : i === step.r ? 'r' : i > step.l && i < step.r ? 'window' : '')} />
    <IndexedSequence label="Running costs" length={run.input.running_costs.length} valueAt={i => run.input.running_costs[i]}
      active={-1} roleAt={i => (i >= step.l && i <= step.r ? 'window' : '')} />
    <section aria-label="Deque of possible maxima">
      <h3>Deque (front is the window maximum)</h3>
      <p>{step.deque.length ? step.deque.map(i => `robot ${i} (charge ${run.input.charge_times[i]})`).join(' | ') : 'empty'}</p>
    </section>
    <output aria-label="Window">{`Window ${step.l} to ${step.r}, cost ${step.cost}, best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The deque keeps robots whose charge times decrease, so its front always holds the maximum charge in the window.</p>
  </>} />
}
