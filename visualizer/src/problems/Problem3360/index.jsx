import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with n stones and a removal of 10.' },
    { id: 'turn', label: 'Turn', description: 'The current player removes the required number of stones.' },
    { id: 'done', label: 'Complete', description: 'The player who cannot move loses.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (1 to 50), for example {"n":12}',
  url: 'https://leetcode.com/problems/stone-removal-game/',
  complexity: 'O(1) time: the required count falls from 10, so there are at most 10 turns.',
  examples: [
    { label: 'Exactly ten', input: '{"n":10}' },
    { label: 'Nine stones', input: '{"n":9}' },
  ],
}

export default function StoneRemovalGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Stones">
      <tbody>
        <tr><th scope="row">Stones left</th><td>{step.stones}</td></tr>
        <tr><th scope="row">Next removal</th><td>{step.need}</td></tr>
        <tr><th scope="row">Last mover</th><td>{step.turn ?? 'none yet'}</td></tr>
      </tbody>
    </table>
  </>} renderReasoning={() => <>
    <p>Alice removes 10, then Bob removes 9, then Alice removes 8, and so on. A player who cannot remove the required amount loses.</p>
    <p>Every move is forced, so the game is a fixed sequence of removals. The first player who cannot remove the required count loses; simulating the turns finds that player.</p>
  </>} />
}
