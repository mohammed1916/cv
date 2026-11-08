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
    { label: 'Example 2', input: '{"heights":[1,2,3,4],"volume":2,"k":2}' }, { label: 'Single column', input: '{"heights":[3],"volume":5,"k":0}' }, { label: 'Equal heights tie', input: '{"heights":[2,2,2,2],"volume":4,"k":1}' }, { label: 'Largest heights and volume', input: '{"heights":[20,0,20,0,20],"volume":50,"k":2}' }, { label: 'Long run: 30 columns', input: '{"heights":[19,13,9,11,6,19,3,1,0,7,9,0,6,10,11,2,14,1,2,14,3,12,20,18,15,17,7,0,4,17],"volume":50,"k":14}' },
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
