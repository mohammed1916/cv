import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No piece has chosen a destination yet.' },
    { id: 'choose', label: 'Choose', description: 'Give this piece a destination that clashes with no earlier piece.' },
    { id: 'reject', label: 'Reject', description: 'This destination would share a square with another piece at some second.' },
    { id: 'count', label: 'Count', description: 'Every piece has a destination, so one combination is valid.' },
    { id: 'done', label: 'Complete', description: 'Report the number of valid combinations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"pieces": ["rook" | "queen" | "bishop", ...], "positions": [[row, column], ...]}',
  url: 'https://leetcode.com/problems/number-of-valid-move-combinations-on-chessboard/',
  complexity: 'Backtracking over each piece\'s reachable squares with pairwise clash checks. The visualization caps input at 3 pieces.',
  examples: [
    { label: 'Rook', input: '{"pieces":["rook"],"positions":[[1,1]]}' },
    { label: 'Two pieces', input: '{"pieces":["rook","bishop"],"positions":[[1,1],[8,8]]}' },
  ],
}

export default function ValidMoveCombinations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Chosen destinations by piece" length={run.input.pieces.length} valueAt={i => `${run.input.pieces[i]}: ${step.picks[i]}`} active={step.piece ?? -1} />
    <output aria-label="Count">{`Valid combinations so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Each piece either stays put or moves along its lines, and a combination is valid only if no two pieces share a square at the same second.</p>
    <p>Choices are made piece by piece, and a clash with any earlier choice removes that branch.</p>
  </>} />
}
