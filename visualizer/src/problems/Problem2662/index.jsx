import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Collect the points and set the start to cost 0.' },
    { id: 'settle', label: 'Settle point', description: 'Take the cheapest point and relax walks and special roads from it.' },
    { id: 'done', label: 'Complete', description: 'Report the cost to the target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Start, target and special roads (JSON)',
  url: 'https://leetcode.com/problems/minimum-cost-of-a-path-with-special-roads/',
  complexity: 'O(P^2) time for P points (at most 12 here), since every point can walk to every other point.',
  examples: [
    { label: 'Example 1', input: '{"start":[1,1],"target":[5,5],"special_roads":[[1,2,3,3,2],[3,4,4,5,1]]}' },
    { label: 'Example 2', input: '{"start":[3,2],"target":[5,7],"special_roads":[[3,2,3,4,4],[3,3,1,0,2],[4,0,0,4,4]]}' },
    { label: 'Start equals target', input: '{"start":[4,4],"target":[4,4],"special_roads":[[0,0,1,1,5]]}' },
    { label: 'Road equal to walking cost', input: '{"start":[0,0],"target":[2,2],"special_roads":[[0,0,2,2,4]]}' },
    { label: 'Corners of the 20 by 20 grid', input: '{"start":[0,0],"target":[20,20],"special_roads":[[0,0,20,20,30],[19,20,20,19,1],[20,20,0,0,1]]}' },
    { label: 'Long run: 5 roads', input: '{"start":[20,15],"target":[14,13],"special_roads":[[6,14,12,16,18],[6,14,17,6,14],[5,14,3,16,24],[5,14,9,5,21],[3,13,15,15,17]]}' },
  ],
}

export default function SpecialRoads() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Points (cost to reach from the start)" length={run.points.length} active={step.point}
      valueAt={i => (step.dist[i] === Infinity ? '∞' : step.dist[i])} roleAt={i => `(${run.points[i][0]}, ${run.points[i][1]})${step.settled[i] ? ' final' : ''}`} />
    <output aria-label="Cost">{`Current point cost: ${step.point >= 0 && step.dist[step.point] !== Infinity ? step.dist[step.point] : '-'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A special road only helps when it is cheaper than walking between its ends, so the search treats each road as one extra edge alongside the Manhattan walks.</p>
  </>} />
}
