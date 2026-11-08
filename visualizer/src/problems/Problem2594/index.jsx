import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the time range from one minute to the fastest single-mechanic time.' },
    { id: 'probe', label: 'Probe', description: 'Count the cars repaired in the middle time.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest time that repairs every car.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with ranks and cars',
  url: 'https://leetcode.com/problems/minimum-time-to-repair-cars/',
  complexity: 'O(m log(min rank * cars^2)) time for m mechanics. The visualization caps input at 4 mechanics and 10 cars.',
  examples: [
    { label: 'Own case 1', input: '{"ranks":[1,3,2,4],"cars":10}' },
    { label: 'Own case 2', input: '{"ranks":[8,1,5],"cars":6}' },
    { label: 'Single mechanic one car', input: '{"ranks":[3],"cars":1}' },
    { label: 'Equal mechanic ranks', input: '{"ranks":[2,2,2],"cars":5}' },
    { label: 'Largest ranks and cars', input: '{"ranks":[8,8,8,8],"cars":10}' },
    { label: 'Long run: four mechanics ten cars', input: '{"ranks":[7,2,6,1],"cars":10}' },
  ],
}

export default function MinimumRepairTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Mechanic ranks" length={run.input.ranks.length} valueAt={i => run.input.ranks[i]} active={-1}
      roleAt={() => ''} />
    <output aria-label="Search">{step.mid === null ? `Time range ${step.low} to ${step.high}` : `Time range ${step.low} to ${step.high}, probe ${step.mid} minutes repairs ${step.repaired} of ${run.input.cars} cars`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>More time never repairs fewer cars, so the smallest time that reaches the target is found by binary search on the time.</p>
  </>} />
}
