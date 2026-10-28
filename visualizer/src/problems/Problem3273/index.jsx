import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Attacks', description: 'Find how many attacks each enemy needs.' },
    { id: 'defeat', label: 'Defeat', description: 'Defeat the next enemy in order; its damage ran until now.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total damage.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with power, damage and health (equal-length arrays)',
  url: 'https://leetcode.com/problems/minimum-amount-of-damage-dealt-to-bob/',
  complexity: 'O(n log n) time for the sort. The visualization caps input at 6 enemies.',
  examples: [
    { label: 'Example 1', input: '{"power":4,"damage":[1,2,3,4],"health":[4,5,6,8]}' },
    { label: 'Example 2', input: '{"power":1,"damage":[1,1,1,1],"health":[1,2,3,4]}' },
  ],
}

export default function MinimumDamageToBob() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const attacks = run.input.health.map(h => Math.ceil(h / run.input.power))
    return <>
      <IndexedSequence label="Enemies (attacks needed / damage per second)" length={attacks.length} valueAt={i => `${attacks[i]} / ${run.input.damage[i]}`} active={step.index} roleAt={i => (step.order.includes(i) ? 'defeated' : '')} />
      <output aria-label="Elapsed time and damage">{`Second ${step.elapsed}, total damage ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each enemy deals its damage every second until it dies. Swapping two adjacent enemies changes only their two terms, so the best order sorts by attacks needed over damage.</p>
    <p>An enemy with many attacks but little damage should wait; this is the classic exchange argument for minimizing weighted completion time.</p>
  </>} />
}
