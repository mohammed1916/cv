import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Player 0 is champion and the others wait in line.' },
    { id: 'game', label: 'Game', description: 'The stronger player wins; the loser goes to the back.' },
    { id: 'done', label: 'Complete', description: 'Report the player who reached k wins in a row.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with skills (distinct) and k',
  url: 'https://leetcode.com/problems/find-the-first-player-to-win-k-games-in-a-row/',
  complexity: 'O(n * k) games, since the strongest player must win within n rounds. The visualization caps n at 12 and k at 20.',
  examples: [
    { label: 'Own case 1', input: '{"skills":[5,3,7,4,10],"k":3}' },
    { label: 'Own case 2', input: '{"skills":[3,6,5],"k":4}' },
    { label: "Two players", input: "{\"skills\": [5, 9], \"k\": 1}" },
    { label: "Largest k", input: "{\"skills\": [1, 50, 100], \"k\": 20}" },
    { label: "Long run: 12 players", input: "{\"skills\": [4, 88, 17, 63, 29, 91, 2, 57, 36, 74, 13, 99], \"k\": 5}" },
  ],
}

export default function FirstToWinKInRow() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Skill levels by player" length={run.input.skills.length} valueAt={i => run.input.skills[i]}
      active={step.champion} roleAt={i => (i === step.challenger ? 'challenger' : '')} />
    <output aria-label="Queue">{`Champion ${step.champion}, streak ${step.streak} of ${run.input.k}, queue ${step.queue.join(' ') || 'empty'}`}</output>
  </>} renderReasoning={() => <>
    <p>The first two players in line play, and the stronger one stays at the front while the loser goes to the back of the queue.</p>
    <p>Since the strongest player never loses, a streak of k is always reached, so the loop always ends.</p>
  </>} />
}
