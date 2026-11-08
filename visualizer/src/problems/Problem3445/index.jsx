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
    { label: 'Repeating 1 and 2, k two', input: '{"s":"12122","k":2}' },
    { label: 'Seven digits, k three', input: '{"s":"4031204","k":3}' },
    { label: 'Own: eight digits, k 3', input: '{"s":"01234123","k":3}' },
    { label: 'Smallest string', input: '{"s":"001","k":2}' },
    { label: 'Equal pairs tie', input: '{"s":"1122","k":2}' },
    { label: 'Longest string, one window', input: '{"s":"0123401234012340","k":1}' },
    { label: 'Long run: 16 digits', input: '{"s":"0334241402340311","k":8}' },
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
