import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
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
    { label: 'Star of three', input: '{"n": 4, "paths": [[1,2],[1,3],[1,4]]}' },
    { label: 'Single garden, no paths', input: '{"n":1,"paths":[]}' },
    { label: 'Two gardens joined', input: '{"n":2,"paths":[[1,2]]}' },
    { label: 'Four gardens in a ring', input: '{"n":4,"paths":[[1,2],[2,3],[3,4],[4,1]]}' },
    { label: 'Long run: twelve gardens', input: '{"n":12,"paths":[[8,5],[11,7],[11,2],[2,1],[12,8],[7,3],[4,12],[11,10],[7,2],[12,3],[10,9],[10,5]]}' },
  ],
}

export default function FlowerPlanting() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, paths } = run.input
    const current = step.garden ? step.garden - 1 : null
    const done = Array.from({ length: n }, (_, i) => i).filter(i => step.garden && i < step.garden - 1)
    const labels = Array.from({ length: n }, (_, i) => `Garden ${i + 1}`)
    const tags = {}
    step.flowers.slice(1).forEach((f, i) => { if (f) tags[i] = `type ${f}` })
    const neighbours = step.garden ? paths.filter(([a, b]) => a === step.garden || b === step.garden).map(([a, b]) => (a === step.garden ? b : a) - 1) : []
    return <>
      <GraphTraversalView title="Gardens and their paths" n={n} edges={paths.map(([a, b]) => [a - 1, b - 1])} labels={labels}
        current={current} neighbour={neighbours[0] ?? null} visited={done} done={done} tags={tags} showFrontier={false} />
      <IndexedSequence label="Flower type per garden (0 means not yet planted)" length={n}
        valueAt={i => step.flowers[i + 1]} active={step.garden ? step.garden - 1 : -1} indexOffset={1}
        roleAt={i => (step.garden && i === step.garden - 1 ? 'current' : step.flowers[i + 1] ? 'written' : '')} />
      <output aria-label="Flower types seen">{`Neighbour flower types: ${step.taken.length ? step.taken.join(', ') : 'none'}`}</output>
    </>
  }} renderReasoning={({ step }) => (
    <>
      <p>{step.message}</p>
      <p>Each garden has at most three paths, so at most three flower types can be blocked and one of the four types is always free.</p>
      <p>Choosing the smallest free type for each garden in order gives a valid answer that is also deterministic.</p>
    </>
  )} />
}
