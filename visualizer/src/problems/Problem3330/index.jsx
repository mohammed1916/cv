import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Count the typed word itself.' },
    { id: 'scan', label: 'Compare neighbours', description: 'Check each adjacent pair.' },
    { id: 'count', label: 'Count repeat', description: 'Add one for each repeated adjacent letter.' },
    { id: 'done', label: 'Result', description: 'Return the total.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'word (JSON object)',
  url: 'https://leetcode.com/problems/find-the-original-typed-string-i/',
  complexity: 'O(n) time and O(1) extra space for word length n (at most 100).',
  examples: [
    { label: 'Example 1', input: '{"word": "abbcccc"}' },
    { label: 'Example 2', input: '{"word": "abcd"}' },
    { label: 'Example 3', input: '{"word": "aaaa"}' },
  ],
}

export default function OriginalTypedStringOneVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Typed word" length={run.input.word.length} active={step.index}
            valueAt={i => run.input.word[i]}
            roleAt={i => (step.index === i && step.repeated ? 'repeat' : '')} />
          <output aria-label="Original count">Total so far: {step.total}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  )
}
