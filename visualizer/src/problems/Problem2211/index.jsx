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
  question: "Count the collisions on a road where cars move left or right at the same speed.",
  approaches: [
    { name: "Count cars that cannot escape", intuition: "Leftward cars at the start and rightward cars at the end drive away with no collision; every other moving car collides once.", time: "O(n)", space: "O(1)" },
  ],
  examples: [
    { label: 'Mixed road', input: 'RLRSLL' },
    { label: 'Leading left cars', input: 'LLRS' },
    { label: 'All stationary', input: 'SSS' },
    { label: 'Single right car', input: 'R' },
    { label: 'Same direction', input: 'RRRRRRRRRRRRRRRR' },
    { label: 'Long run: 16 cars', input: 'LLRRSLRLRSRLLSRS' },
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
