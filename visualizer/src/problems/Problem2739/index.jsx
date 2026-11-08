import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read both tanks and zero the distance.' },
    { id: 'burn', label: 'Burn 5 liters', description: 'Drive 50 km and refill one liter if the auxiliary tank has fuel.' },
    { id: 'done', label: 'Complete', description: 'Add the leftover liters at 10 km each.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with mainTank and additionalTank',
  url: 'https://leetcode.com/problems/total-distance-traveled/',
  complexity: 'O(mainTank) time with a constant-size state. The visualization caps each tank at 100 liters.',
  examples: [
    { label: 'Fifteen liters, four spare', input: '{"mainTank":15,"additionalTank":4}' },
    { label: 'Nine liters, no auxiliary', input: '{"mainTank":9,"additionalTank":0}' },
    { label: 'No extra fuel', input: '{"mainTank":7,"additionalTank":0}' },
    { label: 'Equal tanks', input: '{"mainTank":10,"additionalTank":10}' },
    { label: 'Largest tanks', input: '{"mainTank":100,"additionalTank":100}' },
    { label: 'Mid-sized tanks', input: '{"mainTank":50,"additionalTank":3}' },
  ],
}

export default function TotalDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Tanks">{`Main tank ${step.main} L, auxiliary tank ${step.extra} L, distance ${step.distance} km`}</output>
  </>} renderReasoning={() => <>
    <p>Every five liters burned in the main tank earns a liter from the auxiliary tank, if one is left. The loop runs once per five liters, so the transfer rule is applied at the right moments.</p>
    <p>Whatever is left in the main tank afterwards is driven at 10 km per liter.</p>
  </>} />
}
