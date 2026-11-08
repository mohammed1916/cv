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
    { label: 'Three robots', input: '{"nums":[-3,1,4],"s":"LRR","d":2}' },
    { label: 'Two robots', input: '{"nums":[5,2],"s":"RL","d":1}' },
    { label: 'Zero distance', input: '{"nums":[3,8],"s":"RL","d":0}' },
    { label: 'Robots meet at the same point', input: '{"nums":[0,10],"s":"RL","d":5}' },
    { label: 'Largest coordinates', input: '{"nums":[2000000000,-2000000000],"s":"LR","d":1000000000}' },
    { label: 'Long run: 12 robots', input: '{"nums":[-12,-292,326,410,307,-32,-183,-124,417,-240,493,474],"s":"RLRLRLRLRLRL","d":1000}' },
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
