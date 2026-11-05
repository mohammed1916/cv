import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WordListView from './WordListView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2185',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with words and pref, e.g. {"words":["pay","attention"],"pref":"at"}',
  url: 'https://leetcode.com/problems/counting-words-with-a-given-prefix/',
  complexity: 'O(n * m) time, where m is the prefix length, and O(1) extra space. The visualization caps words at 10 and length at 12.',
  examples: [
    { label: 'Two matches', input: '{"words":["pay","attention","practice","attend"],"pref":"at"}' },
    { label: 'No match', input: '{"words":["leetcode","win","loops"],"pref":"code"}' },
    { label: 'Whole word', input: '{"words":["abc","ab"],"pref":"abc"}' },
  ],
}

export default function Problem2185Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WordListView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
