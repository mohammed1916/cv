import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecurrenceGrid from '../../components/shared/RecurrenceGrid'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Base case', description: 'With every pawn captured, no moves remain.' },
    { id: 'fill', label: 'Fill masks', description: 'Solve captured sets from full down to empty.' },
    { id: 'done', label: 'Result', description: 'Read the value for the start state.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'kx, ky, and positions (JSON object)',
  url: 'https://leetcode.com/problems/maximum-number-of-moves-to-kill-all-pawns/',
  complexity: 'O(2^n * n^2) time and O(2^n * n) space for n pawns, plus n+1 breadth-first searches on the 50 x 50 board. The visualization caps positions at 6 pawns.',
  examples: [
    { label: 'Example 1', input: '{"kx": 1, "ky": 1, "positions": [[0, 0]]}' },
    { label: 'Example 2', input: '{"kx": 0, "ky": 2, "positions": [[1, 1], [2, 2], [3, 3]]}' },
    { label: 'Example 3', input: '{"kx": 0, "ky": 0, "positions": [[1, 2], [2, 4]]}' },
  ],
}

export default function KillPawnsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => {
        const rowLabels = Array.from({ length: 1 << step.n }, (_, m) => m.toString(2).padStart(step.n, '0'));
        const columnLabels = Array.from({ length: step.n + 1 }, (_, i) => (i === 0 ? 'knight' : `pawn ${i - 1}`));
        return (
          <>
            <RecurrenceGrid label="Best remaining total by captured mask (rows) and last point (columns)"
              rowLabels={rowLabels} columnLabels={columnLabels}
              row={step.mask} column={step.last < 0 ? 0 : step.last}
              valueAt={(r, c) => step.best[r]?.[c] ?? ''}
              roleAt={(r, c) => (r === step.mask && c === step.last ? 'current' : '')} />
            <output aria-label="Maximum moves">{step.phase === 'done' ? `Answer: ${step.answer}` : `Mask ${step.mask}`}</output>
          </>
        );
      }}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  )
}
