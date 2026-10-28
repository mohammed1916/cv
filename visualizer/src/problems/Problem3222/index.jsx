import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the full pile of coins.' },
    { id: 'move', label: 'Turn', description: 'Take one 75-coin and four 10-coins, worth 115.' },
    { id: 'done', label: 'Complete', description: 'The player to move next has no legal turn.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Coin counts (JSON object with x and y)',
  url: 'https://leetcode.com/problems/find-the-winning-player-in-coin-game/',
  complexity: 'O(min(x, y / 4)) time and O(1) space. The visualization caps x at 40 and y at 80.',
  examples: [
    { label: 'Alice', input: '{"x":2,"y":7}' },
    { label: 'Bob', input: '{"x":4,"y":11}' },
  ],
}

export default function WinningPlayerCoinGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <output aria-label="Coins remaining">{`75-coins left: ${step.x}, 10-coins left: ${step.y}, turns taken: ${step.turns}`}</output>
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Every legal turn costs exactly one 75-coin and four 10-coins, so the number of turns depends only on the counts, and its parity decides the winner.</p>
  </>} />
}
