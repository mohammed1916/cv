import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2114',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Sentences as a JSON array of lowercase strings',
  url: 'https://leetcode.com/problems/maximum-number-of-words-found-in-sentences/',
  complexity: 'O(total length) time and O(1) extra space beyond the split.',
  examples: [
    { label: 'Middle sentence wins', input: '["one two","red blue green","solo"]' },
    { label: 'Single words', input: '["a","b"]' },
  ],
}

export default function Problem2114Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Word count of each sentence" length={run.input.sentences.length} valueAt={i => step.counts[i] ?? '–'} active={step.i} roleAt={i => (i === step.bestAt ? 'largest' : '')} />
          <p>Largest so far: {step.best}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
