import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Root the tree at node 0 and start with a single-node path.' },
    { id: 'node', label: 'Lower end', description: 'Each node can be the lower end of a downward path.' },
    { id: 'walk', label: 'Walk up', description: 'Climb through ancestors while the value counts stay legal.' },
    { id: 'stop', label: 'Stop', description: 'A second repeat ends the climb; higher ancestors cannot help.' },
    { id: 'keep', label: 'Keep best', description: 'Keep the longer path, or the shorter one on a tie.' },
    { id: 'done', label: 'Result', description: 'Report the best length and node count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with edges ([u, v, length] triples) and nums',
  url: 'https://leetcode.com/problems/longest-special-path-ii/',
  complexity: 'O(n * depth) time in this walk-up model; the visualization caps n at 10.',
  examples: [
    { label: 'Example', input: '{"edges":[[0,1,2],[1,2,3],[1,3,4]],"nums":[1,2,1,3]}' },
    { label: 'Path', input: '{"edges":[[0,1,4]],"nums":[7,7]}' },
  ],
}

export default function LongestSpecialPathII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums by node" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.path.includes(i) ? 'on path' : '')} />
    <output aria-label="Path state">{`walking ${step.path.length ? step.path.join(' up to ') : 'nothing yet'}; ${step.repeat ? 'one repeat used' : 'no repeat yet'}; best [${step.bestLen}, ${step.bestNodes}]`}</output>
  </>} renderReasoning={() => <>
    <p>A special path runs from an ancestor down to a descendant. Starting at each lower end and walking up gives every candidate path exactly once.</p>
    <p>Once a second repeat appears, every higher ancestor produces an illegal path too, so the walk can stop there.</p>
    <p>Distance from the root turns any ancestor-to-descendant length into one subtraction.</p>
  </>} />
}
