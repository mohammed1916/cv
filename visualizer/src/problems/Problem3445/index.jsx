import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no best difference.' },
    { id: 'pair', label: 'Digit pair', description: 'Search substrings where a has an odd count and b an even, nonzero count.' },
    { id: 'done', label: 'Complete', description: 'Report the largest difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with s (digits 0 to 4) and k, for example {"s": "1122211", "k": 3}',
  url: 'https://leetcode.com/problems/maximum-difference-between-even-and-odd-frequency-ii/',
  complexity: 'O(25 * n) time with prefix counts. The visualization caps s at 16 digits.',
  examples: [
    { label: 'Example 1', input: '{"s":"12233","k":4}' },
    { label: 'Example 2', input: '{"s":"1122211","k":3}' },
    { label: 'Example 3', input: '{"s":"110","k":3}' },
  ],
}

export default function EvenOddFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits" length={run.input.s.length} valueAt={index => run.input.s[index]} active={-1} />
    <output aria-label="Pair and best">{`Pair ${step.pair}, best so far ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>For a substring, the difference is count(a) minus count(b). Prefix counts turn every substring into a difference of two prefixes.</p>
    <p>Parities of the two prefixes decide whether the substring has an odd a and an even b, and the b count must be nonzero.</p>
  </>} />
}
