import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Find how often both drones are blocked together.' },
    { id: 'check', label: 'Check', description: 'Test whether this total time has enough free hours.' },
    { id: 'done', label: 'Result', description: 'Report the first total time that works.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with d (two delivery counts) and r (two recharge periods)',
  url: 'https://leetcode.com/problems/minimum-time-to-complete-all-deliveries/description/',
  complexity: 'O(T) checks with O(1) arithmetic each, where T is the answer; the visualization stops at 1000.',
  examples: [
    { label: 'Example', input: '{"d":[2,2],"r":[2,2]}' },
    { label: 'Mixed periods', input: '{"d":[1,1],"r":[2,3]}' },
  ],
}

export default function MinimumTimeToCompleteAllDeliveries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="hour" length={Math.max(step.time, 1)} valueAt={i => (i + 1 === step.time ? 'T' : i + 1)}
      active={step.time - 1} roleAt={i => (run.input.r.some(p => (i + 1) % p === 0) ? 'recharge' : 'free')} />
    <output aria-label="Feasibility">{step.feasible === null ? 'Setting up.' : `T = ${step.time}: ${step.feasible ? 'feasible' : 'not feasible'}`}</output>
  </>} renderReasoning={() => <>
    <p>A drone is blocked at each multiple of its recharge period. Counting its free hours in 1..T is a subtraction.</p>
    <p>Two drones need the free hours to be disjoint. The schedule exists exactly when each drone has enough hours, and together they have enough hours where at least one is free.</p>
  </>} />
}
