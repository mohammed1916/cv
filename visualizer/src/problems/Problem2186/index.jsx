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
  examples: [
    { label: 'Mixed', input: '{"s":"leetcode","t":"coats"}' },
    { label: 'Anagrams', input: '{"s":"night","t":"thing"}' },
    { label: 'Disjoint', input: '{"s":"a","t":"b"}' },
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
