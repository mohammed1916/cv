import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1275',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with moves as [row, column] pairs (JSON)',
  url: 'https://leetcode.com/problems/find-winner-on-a-tic-tac-toe-game/',
  complexity: 'O(1) per move: only the lines through the newest mark are checked on a fixed 3 by 3 board.',
  examples: [
    { label: 'Diagonal win', input: '{"moves":[[0,0],[2,0],[1,1],[2,1],[2,2]]}' },
    { label: 'Column win for B', input: '{"moves":[[0,0],[0,1],[2,2],[1,1],[2,0],[2,1]]}' },
    { label: 'Still pending', input: '{"moves":[[0,0],[1,1]]}' },
    { label: 'Single move', input: '{"moves":[[1,1]]}' },
    { label: 'Row win for A', input: '{"moves":[[0,0],[1,0],[0,1],[1,1],[0,2]]}' },
    { label: 'Long run: full board, draw', input: '{"moves":[[0,0],[0,1],[0,2],[1,1],[1,0],[1,2],[2,1],[2,0],[2,2]]}' },
  ],
}

export default function TicTacToeWinner() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { board, move, lines, winner } = step.snapshot
    const lineSet = new Set(lines)
    return <>
      <table aria-label="Board" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <tbody>{board.map((row, r) => <tr key={r}>{row.map((cell, c) => {
          const isMove = move && move[0] === r && move[1] === c
          return <td key={c} style={{
            width: 44, height: 44, textAlign: 'center', border: `${isMove ? 2 : 1}px solid ${isMove ? 'var(--text)' : 'var(--border)'}`,
            background: isMove ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'transparent', color: 'var(--text)', fontSize: 20,
          }}>{cell || '·'}</td>
        })}</tr>)}</tbody>
      </table>
      <p>{lineSet.size ? `Checked: ${lines.join(', ')}` : 'No line is being checked.'}</p>
      {winner && <p>Current result: <strong>{winner}</strong></p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Local check:</strong> only the row, column and diagonals through the newest mark can have just become complete.</p>
    <p><strong>Outcome:</strong> a completed line wins for its owner; a full board without one is a draw; otherwise the game is pending.</p>
  </>} />
}
