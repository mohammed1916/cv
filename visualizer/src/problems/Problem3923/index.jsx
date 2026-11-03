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
