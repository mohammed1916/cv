import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LetterBarsView from './LetterBarsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2186',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with s and t, e.g. {"s":"leetcode","t":"coats"}',
  url: 'https://leetcode.com/problems/minimum-number-of-steps-to-make-two-strings-anagram-ii/',
  complexity: 'O(n + m) time to count and O(26) to compare. The visualization caps each string at 16 letters.',
  question: "Find the fewest letter additions to either string that make the two strings anagrams of each other.",
  approaches: [
    { name: "Letter count differences", intuition: "Count the letters in each string; the answer is the total absolute difference in each letter's count.", time: "O(n + m)", space: "O(26)" },
  ],
  examples: [
    { label: 'Mixed', input: '{"s":"leetcode","t":"coats"}' },
    { label: 'Anagrams', input: '{"s":"night","t":"thing"}' },
    { label: 'Disjoint', input: '{"s":"a","t":"b"}' },
    { label: 'Identical single letters', input: '{"s":"a","t":"a"}' },
    { label: 'Equal counts, different letters', input: '{"s":"aab","t":"abb"}' },
    { label: 'Longest strings', input: '{"s":"abcdefghijklmnop","t":"zyxwvutsrqponmlk"}' },
    { label: 'Long run: 16 letters', input: '{"s":"qfzzncjqsnrtikja","t":"scamgmmkmupfzqhx"}' },
  ],
}

export default function Problem2186Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LetterBarsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
