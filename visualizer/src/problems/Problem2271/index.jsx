import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the white tile ranges by their start.' },
    { id: 'place', label: 'Place carpet', description: 'Start the carpet at this tile and count what it covers.' },
    { id: 'done', label: 'Complete', description: 'Report the most white tiles a carpet can cover.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with tiles (pairs) and carpet_length',
  url: 'https://leetcode.com/problems/maximum-white-tiles-covered-by-a-carpet/',
  complexity: 'O(m log m) time for the sort and O(m) for the sweep. The visualization caps input at 6 ranges.',
  examples: [
    { label: 'Example 1', input: '{"tiles":[[1,5],[10,11],[12,18],[20,25],[30,32]],"carpet_length":10}' },
    { label: 'Unsorted input', input: '{"tiles":[[10,11],[1,1]],"carpet_length":2}' },
  ],
}

export default function WhiteTilesCarpet() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Tile ranges (sorted)" length={run.tiles.length} valueAt={i => `${run.tiles[i][0]}-${run.tiles[i][1]}`}
      active={step.first} roleAt={i => (i >= step.first && i <= step.last ? 'covered' : '')} />
    <output aria-label="Carpet">{step.start === null ? `Best ${step.best}` : `Carpet ${step.start} to ${step.end}, covers ${step.covered}, best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>An optimal carpet can always start at the left end of some white tile, so trying each tile as the start is enough.</p>
  </>} />
}
