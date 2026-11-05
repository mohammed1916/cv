import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RoadView from './RoadView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2211',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Car directions as letters L, R and S, e.g. RLRSLL',
  url: 'https://leetcode.com/problems/count-collisions-on-a-road/',
  complexity: 'O(n) time and O(1) extra space. The page caps the road at 16 cars.',
  examples: [
    { label: 'Mixed road', input: 'RLRSLL' },
    { label: 'Leading left cars', input: 'LLRS' },
    { label: 'All stationary', input: 'SSS' },
  ],
}

export default function Problem2211Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RoadView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
