import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Compute each city power and the search range.' },
    { id: 'check', label: 'Check', description: 'A city cannot reach the target with the stations left.' },
    { id: 'place', label: 'Place', description: 'Add the missing stations as far right as their range allows.' },
    { id: 'probe', label: 'Probe', description: 'Record whether the middle target is reachable.' },
    { id: 'done', label: 'Complete', description: 'Report the best minimum power.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with stations, r and k',
  url: 'https://leetcode.com/problems/maximize-the-minimum-powered-city/',
  complexity: 'O(n log(sum + k)) time. The visualization caps input at 6 cities.',
  examples: [
    { label: 'Example 1', input: '{"stations":[1,2,4,5,0],"r":1,"k":2}' },
  ],
}

export default function MaximizeMinimumPower() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Stations" length={run.input.stations.length} valueAt={i => run.input.stations[i]} active={step.city}
      roleAt={i => (i === step.city ? 'city' : '')} />
    <output aria-label="Search">{`Target ${step.target ?? 'none'}, range ${step.low} to ${step.high}, stations left ${step.budget}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Placing a missing station further right covers the city it is needed for and also the cities after it, so each placement helps as much as possible.</p>
  </>} />
}
