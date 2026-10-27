import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up with no flowers planted.' },
    { id: 'links', label: 'Links', description: 'Record each path as a link between gardens.' },
    { id: 'collect', label: 'Collect', description: 'Look at the flowers already given to neighbours.' },
    { id: 'assign', label: 'Assign', description: 'Give the garden the smallest unused flower type.' },
    { id: 'done', label: 'Complete', description: 'Report the flower type of every garden.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Gardens and paths as JSON, e.g. {"n": 3, "paths": [[1,2],[2,3]]}',
  url: 'https://leetcode.com/problems/flower-planting-with-no-adjacent/',
  complexity: 'O(n + p) time for p paths, since each garden checks at most three neighbours.',
  examples: [
    { label: 'Example 1', input: '{"n": 3, "paths": [[1,2],[2,3],[3,1]]}' },
    { label: 'Example 2', input: '{"n": 4, "paths": [[1,2],[3,4]]}' },
  ],
}

export default function FlowerPlanting() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="Flower type per garden (0 means not yet planted)" length={run.input.n}
        valueAt={i => step.flowers[i + 1]} active={step.garden ? step.garden - 1 : -1} indexOffset={1} />
      <output aria-label="Flower types seen">{`Neighbour flower types: ${step.taken.length ? step.taken.join(', ') : 'none'}`}</output>
    </>
  )} renderReasoning={() => (
    <>
      <p>Each garden has at most three paths, so at most three flower types can be blocked and one of the four types is always free.</p>
      <p>Choosing the smallest free type for each garden in order gives a valid answer that is also deterministic.</p>
    </>
  )} />
}
