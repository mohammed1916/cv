import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Compute each city power and the search range.' },
    { id: 'check', label: 'Check', description: 'A city cannot reach the target with the stations left.' },
    { id: 'place', label: 'Place', description: 'Add the missing stations as far right as their range allows.' },
    { id: 'probe', label: 'Probe', description: 'Test the middle target and narrow the range.' },
    { id: 'done', label: 'Complete', description: 'Report the best minimum power.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with stations, r and k',
  url: 'https://leetcode.com/problems/maximize-the-minimum-powered-city/',
  complexity: 'O(n log(sum + k)) time. The visualization caps input at 6 cities.',
  examples: [
    { label: 'Own case 1', input: '{"stations":[0,5,4,2,1],"r":1,"k":2}' },
    { label: 'Own case 2', input: '{"stations":[5,5,5,5],"r":1,"k":4}' },
    { label: 'Single city, no extra', input: '{"stations":[3],"r":0,"k":0}' },
    { label: 'Equal stations', input: '{"stations":[2,2,2],"r":1,"k":1}' },
    { label: 'Largest values', input: '{"stations":[5,0,5,0,5,0],"r":2,"k":4}' },
    { label: 'Long run: 6 cities', input: '{"stations":[2,0,3,1,0,2],"r":1,"k":3}' },
  ],
}

export default function MaximizeMinimumPower() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Best minimum power (lo and hi)" min={step.domain[0]} max={step.domain[1]} low={step.low} high={step.high}
      probe={step.target} verdict={step.verdict} />
    <IndexedSequence label="Stations per city" length={run.input.stations.length} valueAt={i => run.input.stations[i]} active={step.city}
      roleAt={i => (i === step.city ? 'checked' : '')} />
    <IndexedSequence label="Power of each city (stations within r)" length={step.power.length} valueAt={i => step.power[i]} active={step.city}
      roleAt={i => (step.city >= 0 && i === step.city ? 'checked' : '')} />
    <output aria-label="Search">{`Target ${step.target ?? 'none'}, range lo ${step.low} to hi ${step.high}, stations left ${step.budget}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The search is over the answer itself. The middle of the range is tested; a reachable middle moves lo up, an unreachable one moves hi down.</p>
    <p>For a fixed target, a missing station is placed as far right as its range allows, because that covers the most cities still to come.</p>
  </>} />
}
