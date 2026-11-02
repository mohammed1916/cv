import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import JoinGridView from './JoinGridView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1181',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'List of phrases (e.g. ["writing code","code rocks"])',
  url: 'https://leetcode.com/problems/before-and-after-puzzle/',
  complexity: 'O(n² · w) time for n phrases with w words each, plus a sort of the distinct results. The visualization caps the input at 12 phrases of at most 6 words; the official bounds were not verified.',
  examples: [
    { label: 'One join', input: '["writing code","code rocks"]' },
    { label: 'Repeated phrase', input: '["mission statement","statement of purpose","mission statement","purpose"]' },
  ],
}

export default function BeforeAndAfterPuzzle() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <JoinGridView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Every ordered pair of different positions is checked once: the last word of the first phrase must equal the first word of the second.
          {run ? ` ${run.answer.length} distinct phrase${run.answer.length === 1 ? '' : 's'} result.` : ''} {step.isNew === false ? 'A repeated merge is kept once, because the result is a set.' : ''}
        </p>
      )}
    />
  )
}
