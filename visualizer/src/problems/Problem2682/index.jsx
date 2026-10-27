import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Friend 1 holds the ball.' },
    { id: 'pass', label: 'Pass', description: 'The holder moves forward by turn times k.' },
    { id: 'repeat', label: 'Repeat', description: 'A friend receives the ball twice and the game ends.' },
    { id: 'done', label: 'Complete', description: 'Report the friends with no receipts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n and k',
  url: 'https://leetcode.com/problems/find-the-losers-of-the-circular-game/',
  complexity: 'O(n) time for the passes until a repeat. The visualization caps n at 30.',
  examples: [
    { label: 'Example 1', input: '{"n":5,"k":2}' },
    { label: 'Example 2', input: '{"n":4,"k":4}' },
  ],
}

export default function CircularGameLosers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Receipts per friend (friend number in brackets is 0-based)" length={run.input.n}
      valueAt={i => step.received[i]} active={step.holder} indexOffset={0}
      roleAt={i => (step.received[i] === 0 ? 'no ball' : '')} />
    <output aria-label="Turn">{`Turn ${step.turn}, holder friend ${step.holder + 1}`}</output>
  </>} renderReasoning={() => <>
    <p>Pass number t moves the ball t times k steps. The first friend to receive it twice ends the game, and everyone else is a loser.</p>
    <p>Holding the counts in one array makes the stop condition a single check.</p>
  </>} />
}
