import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No finish time has been found yet.' },
    { id: 'pair', label: 'Pair', description: 'Choose one land ride and one water ride.' },
    { id: 'land-first', label: 'Land first', description: 'Run the land ride, then the water ride.' },
    { id: 'water-first', label: 'Water first', description: 'Run the water ride, then the land ride.' },
    { id: 'keep', label: 'Keep', description: 'Keep the smallest finish time.' },
    { id: 'done', label: 'Result', description: 'Report the earliest finish time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with landStartTime, landDuration, waterStartTime and waterDuration',
  url: 'https://leetcode.com/problems/earliest-finish-time-for-land-and-water-rides-i/',
  complexity: 'O(n * m) time for n land rides and m water rides, with constant work per pair.',
  examples: [
    { label: 'Example 1', input: '{"landStartTime":[2,8],"landDuration":[4,1],"waterStartTime":[6],"waterDuration":[3]}' },
    { label: 'Example 2', input: '{"landStartTime":[5],"landDuration":[3],"waterStartTime":[1],"waterDuration":[10]}' },
  ],
}

export default function EarliestFinishTimeRidesI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Ride pair">{`land ${step.land >= 0 ? step.land : 'none'}, water ${step.water >= 0 ? step.water : 'none'}`}</output>
    <output aria-label="Best finish">{`best = ${Number.isFinite(step.best) ? step.best : 'infinity'}`}</output>
  </>} renderReasoning={() => <>
    <p>Both rides must be used, and either one can go first. Waiting is allowed, so each ride starts at the later of its own start time and the moment the previous ride ends.</p>
    <p>Trying every land and water pair in both orders covers every plan, and the smallest finish time is the answer.</p>
  </>} />
}
