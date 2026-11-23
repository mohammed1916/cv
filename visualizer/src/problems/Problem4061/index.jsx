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
  question: "Find the fewest queen moves needed to travel from a start square to a target square on an otherwise empty board.",
  approaches: [
    { name: "Line check with pivot", intuition: "One move suffices when the squares share a row, column or diagonal; otherwise try a pivot square that shares a line with both.", time: "O(1)", space: "O(1)" },
    { name: "Breadth-first search", intuition: "Explore queen moves level by level from the start until the target is reached.", time: "O(n^2)", space: "O(n^2)" },
  ],
  examples: [
    { label: 'Diagonal', input: '{"source":[2,6],"target":[5,3]}' },
    { label: 'Two moves', input: '{"source":[1,1],"target":[2,3]}' },
    { label: "Same square, zero moves", input: "{\"source\":[1,1],\"target\":[1,1]}" },
    { label: "Equal coordinates on both axes", input: "{\"source\":[3,3],\"target\":[6,6]}" },
    { label: "Opposite corners", input: "{\"source\":[1,1],\"target\":[8,8]}" },
    { label: "Long run: random squares", input: "{\"source\":[1,3],\"target\":[1,7]}" },
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
