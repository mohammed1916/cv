import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HealthView from './HealthView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2214',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with damage and armor, e.g. {"damage":[2,7,4,3],"armor":4}',
  url: 'https://leetcode.com/problems/minimum-health-to-beat-game/',
  complexity: 'O(n) time and O(1) extra space. The page caps the game at 10 levels.',
  examples: [
    { label: 'Armor on the big hit', input: '{"damage":[2,7,4,3],"armor":4}' },
    { label: 'Armor beyond the hit', input: '{"damage":[2,5,3,4],"armor":7}' },
    { label: 'Equal hits', input: '{"damage":[3,3,3],"armor":2}' },
  ],
}

export default function Problem2214Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <HealthView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
