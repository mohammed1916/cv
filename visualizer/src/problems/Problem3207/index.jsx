import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sorted', description: 'Order the enemies from cheapest to dearest.' },
    { id: 'point', label: 'Point', description: 'Spend energy on the cheapest unmarked enemy.' },
    { id: 'mark', label: 'Mark', description: 'Mark the largest enemy to regain its energy.' },
    { id: 'done', label: 'Result', description: 'No remaining move adds a point.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with enemies (list of energies) and energy',
  url: 'https://leetcode.com/problems/maximum-points-after-enemy-battles/',
  complexity: 'O(n log n) time for the sort; the loop moves two pointers across the sorted list.',
  examples: [
    { label: 'Invented example', input: '{"enemies":[5,1,4],"energy":4}' },
    { label: 'Single enemy', input: '{"enemies":[2],"energy":10}' },
  ],
}

export default function MaximumPointsAfterEnemyBattles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="sorted energies" length={run.input.enemies.length} valueAt={i => [...run.input.enemies].sort((a, b) => a - b)[i]}
      active={step.low ?? -1} roleAt={i => (i === step.low ? 'cheapest' : i === step.high && step.high !== step.low ? 'largest' : '')} />
    <output aria-label="Energy and points">{`points = ${step.points ?? 0}, energy = ${step.energy ?? run.input.energy}`}</output>
  </>} renderReasoning={() => <>
    <p>Points are gained by paying the cheapest unmarked enemy. Marking an enemy is the only way to gain energy, and it requires at least one point first.</p>
    <p>So the loop spends energy on points whenever it can, and marks from the top of the sorted list only when stuck.</p>
  </>} />
}
