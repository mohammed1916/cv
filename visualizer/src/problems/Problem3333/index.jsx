import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecurrenceGrid from '../../components/shared/RecurrenceGrid'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'One way reaches total length 0.' },
    { id: 'run', label: 'Process runs', description: 'Extend the lengths using each run of equal letters.' },
    { id: 'row', label: 'Next row', description: 'Commit the new row of counts.' },
    { id: 'finish', label: 'Too short', description: 'Sum the counts below k.' },
    { id: 'done', label: 'Result', description: 'Subtract from the total product.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'word and k (JSON object)',
  url: 'https://leetcode.com/problems/find-the-original-typed-string-ii/',
  complexity: 'O(n * k) time and O(k) space for n runs, using prefix sums over lengths below k. The visualization caps word length at 40 and k at 40.',
  examples: [
    { label: 'Example 1', input: '{"word": "aabbccdd", "k": 7}' },
    { label: 'Example 2', input: '{"word": "aabbccdd", "k": 8}' },
    { label: 'Example 3', input: '{"word": "aaabbb", "k": 3}' },
  ],
}

export default function OriginalTypedStringTwoVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const rowLabels = ['start', ...step.runs.map(r => `${r.letter} x${r.length}`)];
        const columnLabels = Array.from({ length: step.k }, (_, s) => String(s));
        return (
          <>
            <p>Total originals before the cut: {step.total} · k = {run.input.k}</p>
            <RecurrenceGrid label="Ways to reach each total length" rowLabels={rowLabels} columnLabels={columnLabels}
              row={step.run} column={step.sum}
              valueAt={(r, c) => step.table[r]?.[c] ?? ''}
              roleAt={(r, c) => (r === step.run && c === step.sum ? 'current' : '')} />
            <output aria-label="Answer">{step.phase === 'done' ? `Answer: ${step.result}` : `Too short: ${step.short ?? '...'}`}</output>
          </>
        );
      }}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  )
}
