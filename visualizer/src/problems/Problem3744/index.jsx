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
  question: "Find the character at a given position in a string formed by expanding several words, without building that string.",
  approaches: [
    { name: "Walk the blocks", intuition: "Each word forms blocks of growing length; subtract whole blocks from k until the position falls inside one.", time: "O(total length)", space: "O(1)" },
    { name: "Build the full expanded string", intuition: "Expand every word and index into the result directly.", time: "O(total length)", space: "O(total length)" },
  ],
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
