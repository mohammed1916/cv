import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order players and trainers by ability.' },
    { id: 'match', label: 'Match', description: 'The trainer is at least as strong as the next player.' },
    { id: 'skip', label: 'Skip', description: 'The trainer is too weak for the next player.' },
    { id: 'done', label: 'Complete', description: 'Report the number of matches.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with players and trainers (1 to 8 abilities each, 1 to 20)',
  url: 'https://leetcode.com/problems/maximum-matching-of-players-with-trainers/',
  complexity: 'O(n log n + m log m) time for n players and m trainers. The visualization caps each list at 8.',
  examples: [
    { label: 'Example 1', input: '{"players":[4,7,9],"trainers":[8,2,3,1]}' },
    { label: 'Example 2', input: '{"players":[1,1,1],"trainers":[10]}' },
  ],
}

export default function PlayersAndTrainers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const sortedPlayers = [...run.input.players].sort((a, b) => a - b)
    return <>
      <IndexedSequence label="Sorted players" length={sortedPlayers.length} valueAt={index => sortedPlayers[index]} active={step.next < sortedPlayers.length ? step.next : -1} />
      <output aria-label="Trainer">{`Current trainer: ${step.trainer === -1 ? 'none' : step.trainer}; matches: ${step.matches}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Matching the weakest player each trainer can handle keeps the strongest players available for the strongest trainers.</p>
    <p>A trainer who cannot train the weakest remaining player cannot train anyone else left, so skipping that trainer loses nothing.</p>
  </>} />
}
