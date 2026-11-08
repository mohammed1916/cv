import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No locks are broken yet.' },
    { id: 'state', label: 'State', description: 'Read the factor for this set of broken locks.' },
    { id: 'relax', label: 'Improve', description: 'Breaking this lock next is faster.' },
    { id: 'skip', label: 'Keep', description: 'The known time is already as good.' },
    { id: 'done', label: 'Result', description: 'Report the time to break every lock.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with strength (array) and x',
  url: 'https://leetcode.com/problems/minimum-time-to-break-locks-i/',
  complexity: 'O(2^n * n) time and O(2^n) space, with n at most 8 locks.',
  examples: [
    { label: 'Invented spread', input: '{"strength":[2,6,5],"x":2}' },
    { label: 'Invented equal locks', input: '{"strength":[1,1,1],"x":1}' },
    { label: 'Single lock', input: '{"strength":[7],"x":1}' },
    { label: 'Equal strengths', input: '{"strength":[6,6,6,6],"x":3}' },
    { label: 'Largest spread, x ten', input: '{"strength":[50,1,50,1,50,1,50,1],"x":10}' },
    { label: 'Long run: 8 locks', input: '{"strength":[21,16,16,16,24,11,43,9],"x":7}' },
  ],
}

export default function MinimumTimeToBreakLocksI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Subset state">{`broken mask ${step.mask.toString(2).padStart(4, '0')}, factor ${step.k ?? '-'}, lock ${step.lock >= 0 ? step.lock : '-'}`}</output>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>After breaking a set of locks, the energy gain per minute is fixed by how many were broken, not by their order. That makes the set itself a complete state.</p>
    <p>Each state keeps the least time found for it, and every lock not yet in the set is a possible next lock.</p>
  </>} />
}
