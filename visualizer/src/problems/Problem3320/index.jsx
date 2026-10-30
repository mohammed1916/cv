import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecurrenceGrid from '../../components/shared/RecurrenceGrid'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Round 1', description: 'Seed the counts with Bob first moves.' },
    { id: 'round', label: 'Next rounds', description: 'Extend each sequence with a different move.' },
    { id: 'done', label: 'Result', description: 'Count sequences with a positive difference.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 's of F, W, E letters (JSON object)',
  url: 'https://leetcode.com/problems/count-the-number-of-winning-sequences/',
  complexity: 'O(n^2) time and O(n) space for string length n (score differences are at most n). The visualization caps s at 10 characters.',
  examples: [
    { label: 'Example 1', input: '{"s": "FFF"}' },
    { label: 'Example 2', input: '{"s": "FWEFW"}' },
  ],
}

export default function WinningSequencesVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const rowLabels = ['F', 'W', 'E'].map(move => `Bob ${move}`);
        const columnLabels = Array.from({ length: 2 * step.offset + 1 }, (_, i) => String(i - step.offset));
        return (
          <>
            <p>Alice: {run.input.s} · Round {Math.min(step.round + 1, run.input.s.length)} of {run.input.s.length}</p>
            <RecurrenceGrid label="Sequences ending in each Bob move, by score difference" rowLabels={rowLabels} columnLabels={columnLabels}
              row={0} column={step.offset}
              valueAt={(r, c) => step.dp[r]?.[c] ?? 0}
              roleAt={(r, c) => (c === step.offset ? 'zero difference' : '')} />
            <output aria-label="Winning count">{step.phase === 'done' ? `Winning sequences: ${step.answer}` : 'Counting'}</output>
          </>
        );
      }}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  )
}
