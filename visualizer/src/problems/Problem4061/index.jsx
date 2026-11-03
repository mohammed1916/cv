import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import QueenBoardView from './QueenBoardView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4061',
  phases: [
    { id: 'start', label: 'Squares', description: 'Read the source and target.' },
    { id: 'same', label: 'Same square', description: 'Equal squares need no move.' },
    { id: 'line', label: 'Shared line', description: 'A row, column or diagonal joins them in one move.' },
    { id: 'pivot', label: 'Pivot', description: 'Find a square on a line with both.' },
    { id: 'done', label: 'Result', description: 'Report the number of moves.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with source and target as [row, column] (1 to 8)',
  url: 'https://leetcode.com/problems/minimum-queen-moves-to-reach-target/',
  complexity: 'O(1) time and space: at most 64 pivot checks on the fixed 8 by 8 board.',
  examples: [
    { label: 'Diagonal', input: '{"source":[2,6],"target":[5,3]}' },
    { label: 'Two moves', input: '{"source":[1,1],"target":[2,3]}' },
  ],
}

export default function MinimumQueenMovesVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <QueenBoardView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Minimum queen moves: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
