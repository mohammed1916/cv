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
  question: "Find the minimum starting health so the player survives every level, given one armor that blocks the largest hit once.",
  approaches: [
    { name: "Put the armor on the largest hit", intuition: "Track the total damage and subtract the largest single hit, since the armor is best used on that level.", time: "O(n)", space: "O(1)" },
  ],
  examples: [
    { label: 'Armor on the big hit', input: '{"damage":[2,7,4,3],"armor":4}' },
    { label: 'Armor beyond the hit', input: '{"damage":[2,5,3,4],"armor":7}' },
    { label: 'Equal hits', input: '{"damage":[3,3,3],"armor":2}' },
    { label: 'Single level', input: '{"damage":[9],"armor":1}' },
    { label: 'Largest: ten levels', input: '{"damage":[20,20,20,20,20,20,20,20,20,20],"armor":25}' },
    { label: 'Long run: ten levels', input: '{"damage":[4,11,7,2,18,9,5,13,6,12],"armor":15}' },
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
