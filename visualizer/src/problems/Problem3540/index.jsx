import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HouseRingView from './HouseRingView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at house 0 with the queries it already satisfies.' },
    { id: 'pop', label: 'Settle', description: 'Take the cheapest unsettled state.' },
    { id: 'relax', label: 'Move', description: 'Walk one house and record a cheaper time.' },
    { id: 'done', label: 'Result', description: 'All query houses are visited.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with forward, backward (costs per house) and queries (houses in order)',
  url: 'https://leetcode.com/problems/minimum-time-to-visit-all-houses/',
  complexity: 'O(n * q * (n * q)) time with this simple selection loop, and O(n * q) space for the states. The visualization caps n at 8 houses and queries at 6; a heap would reduce the selection cost.',
  examples: [
    { label: 'Short ring', input: '{"forward":[2,3,1,4],"backward":[1,5,2,2],"queries":[2,0,3]}' },
    { label: 'Lap', input: '{"forward":[4,4,4,4],"backward":[3,3,3,3],"queries":[0,0]}' },
  ],
}

export default function MinimumTimeToVisitAllHouses() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <HouseRingView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each state pairs a house with how many queries have been reached in order, so the walk never needs to remember more than that.</p>
    </>} />
}
