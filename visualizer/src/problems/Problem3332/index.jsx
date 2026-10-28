import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every city starts with 0 points.' },
    { id: 'day', label: 'Day', description: 'For each city, keep the best stay or travel into it.' },
    { id: 'done', label: 'Complete', description: 'Report the best total over all cities.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tour (JSON object with n, k, stay_score and travel_score)',
  url: 'https://leetcode.com/problems/maximum-points-tourist-can-earn/',
  complexity: 'O(k * n^2) time and O(n) space. The visualization caps n and k at 6.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"k":1,"stay_score":[[2,3]],"travel_score":[[0,2],[1,0]]}' },
    { label: 'Example 2', input: '{"n":3,"k":2,"stay_score":[[3,4,2],[2,1,2]],"travel_score":[[0,2,1],[2,0,4],[3,2,0]]}' },
  ],
}

export default function TouristPoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <output aria-label="Best totals by city">{`Day: ${step.day < 0 ? 'before day 0' : step.day}, best by city: ${step.best.join(', ')}`}</output>
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>On each day the tourist either stays in the city or travels, so the best total for a city depends only on the best totals from the previous day.</p>
  </>} />
}
