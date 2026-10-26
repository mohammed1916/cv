import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Reduce to a non-negative target by symmetry.' },
    { id: 'check', label: 'Check sum', description: 'Is the sum at least the target with an even overshoot?' },
    { id: 'step', label: 'Take step', description: 'Add the next step size to the sum.' },
    { id: 'done', label: 'Complete', description: 'Return the minimum number of moves.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Target (JSON integer)',
  url: 'https://leetcode.com/problems/reach-a-number/',
  complexity: 'O(sqrt(|target|)) steps; the visualization caps |target| at 20,000.',
  examples: [{ label: 'Example 1', input: '2' }, { label: 'Example 2', input: '3' }, { label: 'Negative', input: '-10' }, { label: 'Parity fix', input: '5' }],
}

export default function ReachANumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const sums = step.sums || [0]
    return <>
      <IndexedSequence label="Running sums after k steps" length={sums.length} active={sums.length - 1} valueAt={i => sums[i]} roleAt={i => sums[i] >= step.goal ? 'past target' : ''} />
      <output aria-label="Sum versus target">k = {step.k}, sum = {step.total}, target = {step.goal}, overshoot = {Math.max(0, step.total - step.goal)}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>Flipping the sign of step j changes the sum by 2j, so any even overshoot d can be repaired by flipping step d/2 (which exists once the sum is at least d).</p>
    {step.reached !== undefined && <p>{step.reached ? 'Target reached' : 'Below target'}; overshoot parity {step.parityOk ? 'even' : 'odd'}.</p>}
  </>} />
}
