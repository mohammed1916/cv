import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RepeatGridView from './RepeatGridView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '1062',
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no repeat found.' },
    { id: 'pair', label: 'Pair', description: 'Compare two positions.' },
    { id: 'match', label: 'Match', description: 'The letters agree, so extend the run.' },
    { id: 'miss', label: 'Miss', description: 'The letters differ; no run ends here.' },
    { id: 'best', label: 'Best', description: 'A longer repeat was found.' },
    { id: 'done', label: 'Result', description: 'Report the longest repeat.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with a string s',
  url: 'https://leetcode.com/problems/longest-repeating-substring/description/',
  complexity: 'O(n^2) time and O(n^2) space for a string of length n, using a table of runs for each pair of positions. The visualization caps s at 20 characters; the official bound is not verified.',
  examples: [
    { label: 'Overlapping pair', input: '{"s":"banana"}' },
    { label: 'No repeat', input: '{"s":"qwerty"}' },
    { label: 'Two pairs', input: '{"s":"xyzyz"}' },
  ],
}

export default function LongestRepeatingSubstring() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RepeatGridView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} A repeat that ends at positions i and j extends the repeat that ended one step earlier at i-1 and j-1, so each cell builds on its diagonal neighbour.</p>}
    />
  )
}
