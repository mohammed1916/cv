import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import EqualStartGridView from './EqualStartGridView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1794',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and t (lowercase strings)',
  url: 'https://leetcode.com/problems/count-pairs-of-equal-substrings-with-minimum-difference/',
  complexity: 'O(n * m) time and O(1) extra space for strings of lengths n and m, because every start pair is checked once. A single matching letter is enough to witness a pair. The visualization caps each string at 10 letters.',
  examples: [
    { label: 'Diagonal gap', input: '{"s":"abcd","t":"bcde"}' },
    { label: 'Reversed', input: '{"s":"ab","t":"ba"}' },
  ],
}

export default function CountEqualSubstringPairsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <EqualStartGridView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>The smallest gap is found in the same pass that counts ties: a smaller gap resets the count to one, and an equal gap adds to it.</p>
        </>
      )}
    />
  )
}
