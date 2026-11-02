import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Robots keep their directions for d seconds.' },
    { id: 'move', label: 'Move', description: 'Find where this robot ends up.' },
    { id: 'sort', label: 'Sort', description: 'Order the final positions.' },
    { id: 'sum', label: 'Sum', description: 'Add the distances to earlier positions.' },
    { id: 'done', label: 'Result', description: 'Report the sum modulo 1e9+7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, s (L or R per robot) and d',
  url: 'https://leetcode.com/problems/movement-of-robots/',
  complexity: 'O(n log n) time for the sort, then a linear pass over sorted positions. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[-2,0,2],"s":"RLL","d":3}' },
    { label: 'Example 2', input: '{"nums":[1,0],"s":"RL","d":2}' },
  ],
}

export default function MovementOfRobots() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="final positions" length={step.positions.length} valueAt={i => step.positions[i]} active={step.index} />
    <output aria-label="Distance sum">{`positions = [${step.positions.join(', ')}], running total = ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Robots bounce off each other, but two robots that collide only swap identities, so the set of final positions is the same as if they passed through each other.</p>
    <p>After sorting, the distance from each position to all earlier ones is pos times its index minus the prefix sum, which gives all pairwise distances in one pass.</p>
  </>} />
}
