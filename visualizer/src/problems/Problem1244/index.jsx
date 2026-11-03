import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1244',
  phases: [
    { id: 'start', label: 'Empty', description: 'No players are on the board.' },
    { id: 'add', label: 'Add', description: 'Add points to a running total.' },
    { id: 'top', label: 'Top', description: 'Sort the totals and sum the largest k.' },
    { id: 'reset', label: 'Reset', description: 'Remove a player from the board.' },
    { id: 'done', label: 'Result', description: 'Report every top sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: ["add", id, score], ["top", k] or ["reset", id]',
  url: 'https://leetcode.com/problems/design-a-leaderboard/',
  complexity: 'O(1) per add or reset, and O(p log p) per top query for p players. The visualization caps the input at 20 operations.',
  examples: [
    { label: 'Example', input: '{"ops":[["add",1,30],["add",2,50],["add",3,10],["top",2],["add",3,60],["top",2],["reset",2],["top",1]]}' },
  ],
}

export default function DesignALeaderboard() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Board">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each player keeps one running total, so an add never has to scan the board.</p>
    <p>Sorting is deferred until a top query asks for it, which keeps the cost of adds low.</p>
  </>} />
}
