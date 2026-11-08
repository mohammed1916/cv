import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'energy', label: 'Energy', description: 'Training energy once covers the total energy cost.' },
    { id: 'train', label: 'Train experience', description: 'Train just enough experience to exceed the next opponent.' },
    { id: 'win', label: 'Win', description: 'Beat the opponent and gain its experience.' },
    { id: 'done', label: 'Complete', description: 'Report the total training hours.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with initial_energy, initial_experience, energy and experience (1 to 8 opponents)',
  url: 'https://leetcode.com/problems/minimum-hours-of-training-to-win-a-competition/',
  complexity: 'O(n) time for n opponents. The visualization caps opponents at 8.',
  examples: [
    { label: 'Own: three opponents', input: '{"initial_energy":4,"initial_experience":6,"energy":[2,5,1],"experience":[3,1,4]}' },
    { label: 'Already strong', input: '{"initial_energy":2,"initial_experience":4,"energy":[1],"experience":[3]}' },
    { label: 'Single opponent', input: '{"initial_energy":10,"initial_experience":10,"energy":[3],"experience":[2]}' },
    { label: 'Equal opponents', input: '{"initial_energy":4,"initial_experience":4,"energy":[4,4],"experience":[4,4]}' },
    { label: 'Largest energy, eight opponents', input: '{"initial_energy":50,"initial_experience":1,"energy":[20,20,20,20,20,20,20,20],"experience":[20,20,20,20,20,20,20,20]}' },
    { label: 'Long run: 8 opponents', input: '{"initial_energy":25,"initial_experience":25,"energy":[9,6,5,16,3,16,19,4],"experience":[16,5,14,1,19,6,9,13]}' },
  ],
}

export default function TrainingHours() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Opponents (energy, experience)" length={run.input.energy.length} valueAt={index => `${run.input.energy[index]}, ${run.input.experience[index]}`} active={step.opponent} />
    <output aria-label="Totals">{`Experience ${step.exp}; energy hours ${step.energyHours}; experience hours ${step.expHours}`}</output>
  </>} renderReasoning={() => <>
    <p>Energy only falls during the fights, so one lump of energy training up to the total cost plus one is enough.</p>
    <p>Experience only grows, so training it as late as possible is not needed; training just enough before each opponent is optimal because the same hours can be spent in advance without loss.</p>
  </>} />
}
