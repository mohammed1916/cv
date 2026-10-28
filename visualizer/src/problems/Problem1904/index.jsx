import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const clock = slot => `${String(Math.floor(slot / 4)).padStart(2, '0')}:${String((slot % 4) * 15).padStart(2, '0')}`

const definition = {
  phases: [
    { id: 'start', label: 'Session', description: 'Convert the login and logout times to minutes.' },
    { id: 'round', label: 'Round', description: 'Count a round that starts on the quarter hour and ends before logout.' },
    { id: 'done', label: 'Complete', description: 'Report the number of full rounds.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with login_time and logout_time in HH:MM, for example {"login_time":"21:30","logout_time":"03:00"}',
  url: 'https://leetcode.com/problems/the-number-of-full-rounds-you-have-played/',
  complexity: 'O(rounds) time, at most 96 per day. The visualization shows all 96 quarter-hour starts.',
  examples: [
    { label: 'Example 1', input: '{"login_time":"12:01","logout_time":"12:44"}' },
    { label: 'Overnight', input: '{"login_time":"21:30","logout_time":"03:00"}' },
  ],
}

export default function FullRounds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Quarter-hour round starts" length={96} valueAt={index => clock(index)} roleAt={index => (run.slots.includes(index) ? 'completed' : '')} active={step.slot ?? -1} />
    <output aria-label="Rounds">{`Full rounds so far: ${step.slots.length}`}</output>
  </>} renderReasoning={() => <>
    <p>A round starts on a quarter hour and lasts fifteen minutes. The first round you can finish starts at the first quarter hour at or after login.</p>
    <p>Logout after midnight is handled by adding a day to the logout time, then counting each round that ends before logout.</p>
  </>} />
}
