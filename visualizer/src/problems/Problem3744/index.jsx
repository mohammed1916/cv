import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ExpandedTapeView from './ExpandedTapeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Object with words and k (e.g. {\"words\":[\"ab\",\"c\"],\"k\":3})",
  url: "https://leetcode.com/problems/find-kth-character-in-expanded-string/",
  complexity: "O(total length of the words) time in the worst case and O(1) extra space; the expanded string is never built. The visualization caps the input at 8 words of up to 6 letters.",
  examples: [
    { label: "Space lands on index three", input: "{\"words\":[\"ab\",\"c\"],\"k\":3}" },
    { label: "Three words", input: "{\"words\":[\"xyz\",\"pq\",\"r\"],\"k\":8}" },
    { label: "One word", input: "{\"words\":[\"sun\"],\"k\":5}" },
    { label: "Single letter", input: "{\"words\":[\"a\"],\"k\":0}" },
    { label: "Two equal words", input: "{\"words\":[\"ab\",\"ab\"],\"k\":4}" },
    { label: "Largest k with eight six-letter words", input: "{\"words\":[\"abcdef\",\"abcdef\",\"abcdef\",\"abcdef\",\"abcdef\",\"abcdef\",\"abcdef\",\"abcdef\"],\"k\":174}" },
    { label: "Long run: 8 words", input: "{\"words\":[\"myfjuj\",\"j\",\"alf\",\"cajji\",\"mvki\",\"xtbs\",\"c\",\"xata\"],\"k\":53}" },
  ],
}

export default function Problem3744Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ExpandedTapeView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step ? step.message : ''} {run ? `Result: ${JSON.stringify(run.result)}.` : ''}
        </p>
      )}
    />
  )
}
