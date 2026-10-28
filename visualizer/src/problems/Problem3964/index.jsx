import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Existing light', description: 'Mark what the given bulbs already light.' },
    { id: 'place', label: 'Extra bulb', description: 'The leftmost dark position gets an extra bulb one step to its right.' },
    { id: 'done', label: 'Return', description: 'Report the number of extra bulbs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"lights": [...]}',
  url: 'https://leetcode.doocs.org/en/lc/3964/',
  complexity: 'O(n) time and O(n) extra space. The visualization caps the road at 8 positions.',
  examples: [
    { label: 'Example 1', input: '{"lights":[0,0,0,0]}' },
    { label: 'Example 2', input: '{"lights":[0,0,0,2,0]}' },
  ],
}

export default function MinimumLights() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Lit positions" length={run.input.lights.length} valueAt={j => (step.lit[j] ? 'lit' : 'dark')} active={step.p} />
    <output aria-label="Extra bulbs">{`Extra bulbs so far: ${step.extra}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>The leftmost dark position can only be lit by a bulb at most one step to its right, and placing it there lights the most ground beyond.</p>
    <p>Each extra bulb covers three positions, so this greedy choice is optimal.</p>
  </>} />
}
