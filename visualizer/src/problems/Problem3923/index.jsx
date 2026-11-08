import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GenerationView from './GenerationView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3923',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with points (distinct triples) and target (a triple), coordinates 0 to 6',
  url: 'https://leetcode.com/problems/minimum-generations-to-target-point/',
  complexity: 'Each generation scans pairs of known triples; at most 7^3 = 343 distinct triples exist, so the search is bounded. The visualization shows every pair as a chip.',
  examples: [
    { label: 'Midpoint reach', input: '{"points":[[0,0,0],[6,6,6]],"target":[3,3,3]}' },
    { label: 'Second generation', input: '{"points":[[0,0,0],[6,0,0]],"target":[1,0,0]}' },
    { label: 'Target is the only point', input: '{"points":[[2,2,2]],"target":[2,2,2]}' },
    { label: 'Equal distance pair', input: '{"points":[[0,0,0],[2,2,2]],"target":[1,1,1]}' },
    { label: 'Opposite corners', input: '{"points":[[0,0,0],[6,6,6],[0,6,0]],"target":[6,6,6]}' },
    { label: 'Long run: 20 points', input: '{"points":[[6,4,3],[2,3,3],[6,2,5],[5,4,5],[4,3,3],[2,0,1],[1,6,5],[0,1,6],[5,2,4],[0,5,5],[1,0,4],[3,5,2],[6,1,6],[4,5,4],[4,4,2],[6,6,0],[2,5,6],[1,6,3],[4,3,0],[0,4,6]],"target":[0,2,4]}' },
  ],
}

export default function Problem3923Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GenerationView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
