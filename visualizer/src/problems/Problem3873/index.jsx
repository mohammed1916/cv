import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Coordinates', description: 'Each x and y value starts alone.' },
    { id: 'join', label: 'Join', description: 'Each point links its x value with its y value.' },
    { id: 'count', label: 'Count', description: 'Pick the two largest groups.' },
    { id: 'done', label: 'Result', description: 'Report the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points (distinct [x, y] pairs)',
  url: 'https://leetcode.com/problems/maximum-points-activated-with-one-addition/',
  complexity: 'Joining groups costs near-linear time in the number of points. The visual caps the input at 12 points.',
  examples: [
    { label: 'Example', input: '{"points":[[0,0],[0,5],[7,5],[9,9]]}' },
    { label: 'Two singles', input: '{"points":[[0,0],[1,1]]}' },
  ],
}

export default function MaximumPointsActivatedWithOneAddition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Activation groups">{step.groups.map((group, index) => <li key={index} data-role="window">
      <strong>Group {index + 1}</strong>: {group.map(([x, y]) => `(${x}, ${y})`).join(' ')}</li>)}</ul>
    <output aria-label="Best total">{step.best === null ? `Groups so far: ${step.groups.length}` : `Best activation count: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Two points on the same vertical or horizontal line pass activation along, so any chain of such links ends up in one cluster.</p>
    <p>Adding a point at a chosen x and y links two groups, and the activated total is their sizes plus the new point, so the best choice uses the two largest groups.</p>
  </>} />
}
