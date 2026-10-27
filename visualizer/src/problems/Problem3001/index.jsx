import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'rook', label: 'Rook', description: 'Check whether the rook captures in one move.' },
    { id: 'bishop', label: 'Bishop', description: 'Check whether the bishop captures in one move.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum number of moves.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a, b (rook), c, d (bishop), e, f (queen), 1-indexed (JSON)',
  url: 'https://leetcode.com/problems/minimum-moves-to-capture-the-queen/',
  complexity: 'O(1) time on an 8 by 8 board.',
  examples: [
    { label: 'Rook captures', input: '{"a":5,"b":3,"c":3,"d":4,"e":5,"f":2}' },
    { label: 'Two moves', input: '{"a":1,"b":1,"c":8,"d":8,"e":2,"f":3}' },
  ],
}

export default function CaptureTheQueen() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const board = Array.from({ length: 8 }, () => new Array(8).fill('·'))
    board[run.rook[0] - 1][run.rook[1] - 1] = 'R'
    board[run.bishop[0] - 1][run.bishop[1] - 1] = 'B'
    board[run.queen[0] - 1][run.queen[1] - 1] = 'Q'
    return <>
      <MatrixGrid label="Board (row = a, column = b; R rook, B bishop, Q queen)" matrix={board} showFlatIndices={false} />
      <output aria-label="Check">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>A rook captures along its row or column and a bishop along its diagonal, provided no other piece stands between them.</p>
    <p>If neither piece lines up with the queen unblocked, one quiet move repositions a piece so that it does, which gives two.</p>
  </>} />
}
