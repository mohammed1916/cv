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
  question: "Return the largest number of words in any sentence, where words are separated by single spaces.",
  approaches: [
    { name: "Count spaces and add one", intuition: "Each sentence has one more word than it has spaces, so count spaces per sentence and keep the maximum.", time: "O(total length)", space: "O(1)" },
  ],
  examples: [
    { label: 'Middle sentence wins', input: '["one two","red blue green","solo"]' },
    { label: 'Single words', input: '["a","b"]' }, { label: "Single sentence", input: "[\"a\"]" }, { label: "Equal sentences", input: "[\"ab\",\"ab\"]" }, { label: "Longest sentence", input: "[\"abcdefghij klmnopqrst uvwxyzabcd efghijk\"]" }, { label: "Long run: 12 sentences", input: "[\"scar zw\",\"m rzmsz zuvv shy\",\"ckmk harv ddey bew\",\"h es qc\",\"fm\",\"f cmass\",\"lag ubxh b b\",\"c w k pjgi\",\"ml etbop lmnh\",\"j kvaru hxbei\",\"lzx w\",\"noz ffc opcj uinn\"]" },
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
