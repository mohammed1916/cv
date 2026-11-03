import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1279',
  phases: [
    { id: 'start', label: 'Start', description: 'Road 1 has the green light.' },
    { id: 'switch', label: 'Switch', description: 'The green light moves to the car road.' },
    { id: 'cross', label: 'Cross', description: 'The car crosses on its green road.' },
    { id: 'done', label: 'Result', description: 'Report the crossing log.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arrivals: [car id, road 1 to 4] pairs',
  url: 'https://leetcode.com/problems/traffic-light-controlled-intersection/',
  complexity: 'O(1) per car. The concurrent version uses a lock so only one road holds the light at a time.',
  examples: [
    { label: 'Example', input: '{"arrivals":[[1,1],[2,1],[3,3],[4,3],[5,1]]}' },
  ],
}

export default function TrafficLightControlledIntersection() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Crossing log">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only one road can be green at once. A car on a different road forces the light to move, and then that car crosses.</p>
    <p>In a concurrent version this is a lock around the light, so two cars never cross on different roads at the same moment.</p>
  </>} />
}
