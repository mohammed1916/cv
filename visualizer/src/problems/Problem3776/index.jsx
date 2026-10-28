import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'find', label: 'Deficit', description: 'Find the person who is short.' },
    { id: 'take', label: 'Take units', description: 'Take units from the nearest people with a surplus.' },
    { id: 'done', label: 'Complete', description: 'Report the total moves, or -1 if impossible.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Balances (JSON object with balance)',
  url: 'https://leetcode.com/problems/minimum-moves-to-balance-circular-array/',
  complexity: 'O(n log n) time for sorting people by distance. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"balance":[5,1,-4]}' },
    { label: 'Example 2', input: '{"balance":[1,2,-5,2]}' },
    { label: 'Impossible', input: '{"balance":[-3,2]}' },
  ],
}

export default function MinimumMovesToBalanceCircularArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const balance = run.input.balance
    const roleAt = i => (i === step.person ? 'current' : '')
    return <IndexedSequence label="Balance" length={balance.length} valueAt={i => balance[i]} active={step.person >= 0 ? step.person : -1} roleAt={roleAt} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each unit moves one step per move, so the cost of a unit is its distance around the circle to the short person.</p>
  </>} />
}
