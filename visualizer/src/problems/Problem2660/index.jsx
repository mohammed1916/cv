import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Both scores start at zero.' },
    { id: 'turn', label: 'Turn', description: 'Score each player’s pins, doubled after a recent ten.' },
    { id: 'done', label: 'Complete', description: 'Compare the totals.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with player1 and player2 (pins per turn)',
  url: 'https://leetcode.com/problems/determine-the-winner-of-a-bowling-game/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps each game at 10 turns.',
  examples: [
    { label: 'Example 1', input: '{"player1":[4,10,7,9],"player2":[6,5,2,3]}' },
    { label: 'Tie', input: '{"player1":[1,2],"player2":[1,2]}' },
    { label: 'Single turn', input: '{"player1":[3],"player2":[5]}' },
    { label: 'All zero pins', input: '{"player1":[0,0,0],"player2":[0,0,0]}' },
    { label: 'Largest: 10 turns of 10', input: '{"player1":[10,10,10,10,10,10,10,10,10,10],"player2":[10,10,10,10,10,10,10,10,10,10]}' },
    { label: 'Long run: 10 turns', input: '{"player1":[3,5,7,9,1,10,2,10,7,3],"player2":[2,6,2,3,8,6,3,3,4,9]}' },
  ],
}

export default function BowlingWinner() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Player 1 pins" length={run.input.player1.length} valueAt={i => run.input.player1[i]}
      active={step.turn} roleAt={i => (step.doubled1.includes(i) ? 'doubled' : '')} />
    <IndexedSequence label="Player 2 pins" length={run.input.player2.length} valueAt={i => run.input.player2[i]}
      active={step.turn} roleAt={i => (step.doubled2.includes(i) ? 'doubled' : '')} />
    <output aria-label="Scores">{`Player 1: ${step.score1}, player 2: ${step.score2}`}</output>
  </>} renderReasoning={() => <>
    <p>A pin count is doubled when the same player hit a ten on either of the two previous turns.</p>
    <p>Each turn only needs a look back two places, so the whole game is one pass.</p>
  </>} />
}
