import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the board.' },
    { id: 'count', label: 'Count pieces', description: 'Count X and O.' },
    { id: 'check', label: 'Find winner', description: 'Look for a completed line.' },
    { id: 'invalid', label: 'Rule broken', description: 'The state cannot arise in a real game.' },
    { id: 'done', label: 'Complete', description: 'Return the verdict.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Board (JSON array of 3 strings)',
  url: 'https://leetcode.com/problems/valid-tic-tac-toe-state/',
  complexity: 'O(1): the board has 9 cells and 8 lines.',
  examples: [
    { label: 'O first (false)', input: '["O  ","   ","   "]' },
    { label: 'Both win (false)', input: '["XXX","   ","OOO"]' },
    { label: 'Valid midgame (true)', input: '["XOX","O O","XOX"]' },
    { label: 'X wins validly (true)', input: '["XXX","OO ","   "]' },
  ],
}
export default function ValidTicTacToeState() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {[0, 1, 2].map(r => <IndexedSequence key={r} label={`Row ${r}`} length={3} indexOffset={r * 3} valueAt={c => step.cells[r * 3 + c] === ' ' ? '·' : step.cells[r * 3 + c]} roleAt={c => step.line && step.line.includes(r * 3 + c) ? 'win' : ''} />)}
    <output aria-label="Counts">X: {step.x}, O: {step.o}{step.phase === 'done' ? `. Valid: ${run.result}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Rules: X moves first (so X = O or X = O + 1); a winner ends the game immediately, so an X win needs X = O + 1 and an O win needs X = O. Both players winning is covered by these two rules.</p>
  </>} />
}
