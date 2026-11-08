import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WordDistanceAnchorsView from './WordDistanceAnchorsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "List of lowercase words (e.g. [\"cat\",\"dog\",\"cat\"])",
  url: "https://leetcode.com/problems/maximum-distance-between-unequal-words-in-array-i/",
  complexity: "O(n) time and O(1) extra space: one scan from the right against the first word and one from the left against the last word. The visualization caps the list at 12 words.",
  examples: [
    { label: "Mid-list difference", input: "[\"cat\",\"cat\",\"dog\",\"cat\",\"cat\"]" },
    { label: "Scattered words", input: "[\"red\",\"blue\",\"blue\",\"red\",\"green\",\"red\"]" },
    { label: "All equal", input: "[\"ink\",\"ink\",\"ink\"]" },
    { label: 'Single word', input: '["ink"]' },
    { label: 'Repeated pairs', input: '["cat","dog","cat","dog"]' },
    { label: 'Longest words', input: '["zzzzzzzz","abcdefgh"]' },
    { label: 'Long run: 12 words', input: '["h","ed","bed","gfah","dgfah","ahcbed","fahcbed","cbedgfah","h","ed","bed","gfah"]' },
  ],
}

export default function Problem3696Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WordDistanceAnchorsView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
