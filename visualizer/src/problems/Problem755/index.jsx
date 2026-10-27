import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ground', description: 'The heights before any water is dropped.' },
    { id: 'drop', label: 'Drop a unit', description: 'Water flows to the lowest reachable spot, left first.' },
    { id: 'done', label: 'Settled', description: 'All water has settled.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'heights, volume and k (JSON)',
  url: 'https://leetcode.com/problems/pour-water/',
  complexity: 'O(volume * n) time with this scan. The visualization caps input at 30 heights and 50 units.',
  examples: [
    { label: 'Example 1', input: '{"heights":[2,1,1,2,1,2,2],"volume":4,"k":3}' },
    { label: 'Example 2', input: '{"heights":[1,2,3,4],"volume":2,"k":2}' },
  ],
}

export default function PourWater() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Ground height (k marked by the run's drop index)" length={step.heights.length} active={step.index ?? run.input.k}
      valueAt={i => step.heights[i]} roleAt={i => (i === run.input.k ? 'read' : '')} />
    <output aria-label="Drop">{step.drop ? `Unit ${step.drop} of ${run.input.volume}` : 'Before the first unit'}</output>
  </>} renderReasoning={() => <>
    <p>Water dropped at k looks left first. It moves left while the ground does not rise, and settles at the lowest point it reaches. Only if no lower spot lies to the left does it try the right side.</p>
    <p>Each unit raises one cell by one, so the total always grows by the volume.</p>
  </>} />
}
