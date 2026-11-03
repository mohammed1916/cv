import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start room', description: 'Begin with full health at this room.' },
    { id: 'point', label: 'Point', description: 'Health after the room meets its requirement.' },
    { id: 'miss', label: 'No point', description: 'Health after the room is below its requirement.' },
    { id: 'sum', label: 'Add score', description: 'Add this start’s points to the total.' },
    { id: 'done', label: 'Result', description: 'The total over all starting rooms.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with hp, damage and requirement (equal-length lists)',
  url: 'https://leetcode.com/problems/total-score-of-dungeon-runs/',
  complexity: 'O(n^2) time with O(1) extra space for the simulation shown. A prefix-sum and Fenwick approach can be faster for large n.',
  examples: [
    { label: 'Mixed', input: '{"hp":10,"damage":[2,3,4],"requirement":[5,4,1]}' },
    { label: 'One room', input: '{"hp":3,"damage":[5],"requirement":[1]}' },
  ],
}

export default function TotalScoreOfDungeonRuns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="damage" length={run.input.damage.length} valueAt={i => run.input.damage[i]} active={step.at >= 0 ? step.at : step.start}
      roleAt={i => (step.start >= 0 && i >= step.start ? 'window' : '')} />
    <output aria-label="Dungeon run state">{`start room ${step.start >= 0 ? step.start + 1 : '-'}, health ${step.health ?? '-'}, score ${step.score ?? '-'}, total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each starting room is a separate run, so the simulation restarts health at hp and walks forward through the rooms that follow.</p>
    <p>A room earns a point only when the health left after its damage is still at least its requirement. Health can go negative, and the run continues anyway.</p>
  </>} />
}
