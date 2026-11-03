import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'Player one starts as the active player.' },
    { id: 'swap', label: 'Swap', description: 'Odd points or a sixth game changes the active player.' },
    { id: 'score', label: 'Score', description: 'The active player gains the game points.' },
    { id: 'done', label: 'Result', description: 'Report the score difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums',
  url: 'https://leetcode.com/problems/find-the-score-difference-in-a-game/',
  complexity: 'One pass over the games, so O(n) time and O(1) extra space. The visual caps the list at 16 games.',
  examples: [
    { label: 'Example', input: '{"nums":[2,3,4]}' },
    { label: 'Sixth game', input: '{"nums":[7,2,2,2,2,2]}' },
  ],
}

export default function FindTheScoreDifferenceInAGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Games" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.game ?? -1}
      roleAt={i => (i === step.game ? 'game' : '')} />
    <output aria-label="Scores">{`Player 1: ${step.score[0]} · Player 2: ${step.score[1]} · active: player ${step.active + 1}`}</output>
  </>} renderReasoning={() => <>
    <p>Only one player scores at a time. An odd number flips who is active, and every sixth game flips it once more.</p>
    <p>The flips happen before the points are added, so the game's points go to whichever player is active after the flips.</p>
  </>} />
}
