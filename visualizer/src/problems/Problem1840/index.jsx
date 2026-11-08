import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Caps', description: 'Building 1 is 0 and restricted buildings have their caps.' },
    { id: 'forward', label: 'From left', description: 'A building cannot be more than one taller than the building before it.' },
    { id: 'backward', label: 'From right', description: 'A building cannot be more than one taller than the building after it.' },
    { id: 'peak', label: 'Peak', description: 'The tallest building between two caps is found from their heights and distance.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum height.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n (2 to 8) and restrictions: [building, maxHeight] pairs, building from 2 to n',
  url: 'https://leetcode.com/problems/maximum-building-height/',
  complexity: 'O(n log n) time for n buildings. The visualization caps n at 8.',
  examples: [
    { label: 'Three caps on six buildings', input: '{"n":6,"restrictions":[[4,1],[2,0],[6,3]]}' },
    { label: 'No caps', input: '{"n":6,"restrictions":[]}' },
  { label: 'Smallest n', input: "{\"n\":2,\"restrictions\":[]}" },
  { label: 'Equal caps', input: "{\"n\":4,\"restrictions\":[[2,3],[3,3]]}" },
  { label: 'Caps at the maximum', input: "{\"n\":8,\"restrictions\":[[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10]]}" },
  { label: 'Long run: n = 8, varied caps', input: "{\"n\":8,\"restrictions\":[[2,1],[3,4],[4,3],[5,6],[6,5],[7,1],[8,0]]}" },
  ],
}

export default function MaximumBuildingHeight() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Building limits (1 to n)" length={run.input.n} valueAt={index => (Number.isFinite(step.limit[index + 1]) ? step.limit[index + 1] : 'free')} active={step.building - 1} />
    <output aria-label="Best height">{`Best height so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Each building's cap is tightened by its neighbours: a building cannot be more than one taller than a neighbour, so one pass from each side settles every cap.</p>
    <p>Between two capped buildings, the tallest possible building rises from one cap and falls to the other, which gives the peak (a + b + distance) divided by two.</p>
  </>} />
}
