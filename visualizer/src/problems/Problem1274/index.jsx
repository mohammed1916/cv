import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1274',
  phases: [
    { id: 'start', label: 'Grid', description: 'Start with the full grid.' },
    { id: 'empty', label: 'Empty', description: 'The rectangle has no area.' },
    { id: 'oracle', label: 'Oracle', description: 'The oracle says no ships are inside.' },
    { id: 'split', label: 'Split', description: 'Halve the rectangle along its longer side.' },
    { id: 'cell', label: 'Cell', description: 'A single cell with a ship counts as 1.' },
    { id: 'done', label: 'Result', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with size (grid side) and ships: [[x, y], ...]',
  url: 'https://leetcode.com/problems/number-of-ships-in-a-rectangle/',
  complexity: 'Each ship causes at most O(log size) splits along each path, so the oracle is called a small number of times per ship. The visualization uses a local stand-in for the oracle.',
  examples: [
    { label: 'Example', input: '{"size":4,"ships":[[0,0],[2,3],[3,1]]}' },
    { label: 'Empty grid', input: '{"size":3,"ships":[]}' },
  ],
}

export default function NumberOfShipsInARectangle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Ships found">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The oracle only answers whether a rectangle contains any ship, so the search narrows down by halving rectangles that report ships.</p>
    <p>An empty answer prunes a whole region at once, which is why the number of oracle calls stays small when ships are sparse.</p>
  </>} />
}
