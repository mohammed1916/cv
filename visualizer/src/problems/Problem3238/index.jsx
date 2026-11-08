import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the winner set to empty.' },
    { id: 'pick', label: 'Pick', description: 'Update the count for this player and color.' },
    { id: 'done', label: 'Complete', description: 'Return the number of winners.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "n" and "pick" ([player, color] pairs), JSON',
  url: 'https://leetcode.com/problems/find-the-number-of-winning-players/',
  complexity: 'O(p) time for p picks with a hash map. The visualization caps input at 20 picks.',
  examples: [
    { label: 'Own case 1', input: '{"n":5,"pick":[[1,1],[2,1],[2,1],[3,2],[3,2],[3,1]]}' },
    { label: 'Own case 2', input: '{"n":6,"pick":[[2,2],[3,5],[3,5],[3,5]]}' },
    { label: 'Smallest game', input: '{"n":2,"pick":[[0,0]]}' },
    { label: 'Tie between two players', input: '{"n":3,"pick":[[0,1],[1,1],[2,1]]}' },
    { label: 'Largest player count', input: '{"n":6,"pick":[[5,10]]}' },
    { label: 'Long run: 20 picks', input: '{"n":6,"pick":[[2,9],[3,7],[2,6],[4,2],[1,2],[3,3],[5,9],[0,7],[4,2],[4,3],[0,1],[0,10],[5,0],[0,4],[3,8],[5,0],[0,5],[3,9],[4,1],[4,8]]}' },
  ],
}

export default function FindTheNumberOfWinningPlayers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Picks (player:color)' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Player i needs i + 1 balls of one color, so each pick is compared with the count for its player and color.</p>
    <p>Once a player wins, further picks cannot change the answer, but the loop still records them in the set.</p>
  </>} />
}
