import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start square', description: 'All probability sits on the start square.' },
    { id: 'step', label: 'One knight move', description: 'Each square passes one eighth of its probability to every legal target.' },
    { id: 'done', label: 'Total', description: 'Add the probability still on the board.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Board (JSON object with n, k, row and column)',
  url: 'https://leetcode.com/problems/knight-probability-in-chessboard/',
  complexity: 'O(k · n²) time and O(n²) space for the probability boards.',
  examples: [
    { label: 'One move', input: '{"n":3,"k":1,"row":1,"column":1}' },
    { label: 'Corner, two moves', input: '{"n":4,"k":2,"row":0,"column":0}' },
    { label: 'No moves', input: '{"n":5,"k":0,"row":2,"column":2}' },
  ],
}

export default function KnightProbability() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { row, column } = run.input
    return <>
      <MatrixGrid label={`Probability after ${step.step} move(s); start square marked`} matrix={step.board.map(r => r.map(v => Number(v.toFixed(4))))}
        activeCell={{ row, col: column }} cellWidth={64} cellHeight={48} />
      <output aria-label="Probability still on board">{`On the board: ${step.board.flat().reduce((a, b) => a + b, 0).toFixed(4)}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why divide by eight:</strong> a knight has at most eight moves, and each move is equally likely; moves that leave the board simply lose their share.</p>
  </>} />
}
