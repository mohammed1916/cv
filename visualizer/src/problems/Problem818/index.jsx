import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Create the dp table with dp[0] = 0.' },
    { id: 'exact', label: 'Exact landing', description: 'Targets of the form 2^k - 1 need k accelerations.' },
    { id: 'overshoot', label: 'Overshoot', description: 'Run past the target, reverse, and drive back.' },
    { id: 'backoff', label: 'Back off early', description: 'Reverse before the target, retreat j steps, reverse again.' },
    { id: 'done', label: 'Complete', description: 'Return dp[target].' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Target (JSON integer)',
  url: 'https://leetcode.com/problems/race-car/',
  complexity: 'O(target log target) time, O(target) space. Each target tries O(log target) turn-around points.',
  examples: [{ label: 'Target 3', input: '3' }, { label: 'Target 6', input: '6' }, { label: 'Target 100', input: '100' }],
}
export default function RaceCar() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="dp: fewest instructions to reach each position" length={run.input + 1} active={step.t}
      valueAt={i => i < step.filled ? run.dp[i] : '?'} roleAt={i => i < step.filled ? 'solved' : ''} />
    <output aria-label="Current candidate">Position {step.t}: best so far {step.best}{step.cand !== undefined ? ` (candidate ${step.cand})` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>The car's speed doubles on each A, so after k accelerations it sits at 2^k - 1. Optimal paths only reverse at a few meaningful places.</p>
    <p>Position {step.t} needs k = {step.k} bits. Either overshoot to 2^k - 1 and come back, or reverse one acceleration earlier, retreat, and recurse on the remainder.</p>
    {step.phase === 'backoff' && <p>Retreating {step.back} units leaves {step.t - step.back} to cover, a smaller subproblem already in the table.</p>}
  </>} />
}
