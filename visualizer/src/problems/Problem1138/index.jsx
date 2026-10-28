import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

// The board as the problem draws it: five letters per row, with z alone on the last row.
const board = Array.from({ length: 6 }, (_, row) => Array.from({ length: 5 }, (_, col) => {
  const i = row * 5 + col
  return i < 26 ? String.fromCharCode(97 + i) : ''
}))

const definition = {
  phases: [
    { id: 'start', label: 'Start at a', description: 'The walker starts on a, at row 0 and column 0.' },
    { id: 'letter', label: 'Select letters', description: 'Move to each letter of the target and select it with !.' },
    { id: 'done', label: 'Complete', description: 'Report the full move sequence.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a lowercase target string',
  url: 'https://leetcode.com/problems/alphabet-board-path/',
  complexity: 'O(n) time for n target letters, since each move is computed from row and column arithmetic. The visualization caps the target at 100 letters.',
  examples: [
    { label: 'Example 1', input: '{"target":"leet"}' },
    { label: 'Example 2', input: '{"target":"code"}' },
  ],
}

export default function AlphabetBoardPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid label="Letter board" matrix={board} activeCell={{ row: step.row, col: step.col }} showFlatIndices={false} />
    <output aria-label="Typed so far">{`Typed: ${step.typed || '(nothing yet)'}`}</output>
    <output aria-label="Moves">{`Moves: ${step.moves || '(none yet)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each letter sits at row floor(i / 5) and column i mod 5. The walker moves vertically first, then horizontally, and then presses !.</p>
    <p>The letter z sits alone on the last row, so it is reached by moving left first and then down, which keeps every step on the board.</p>
  </>} />
}
