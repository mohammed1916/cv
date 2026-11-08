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
    { label: 'Single word', input: '{"words":["cat"],"pref":"ca"}' },
    { label: 'Duplicate words count twice', input: '{"words":["ab","ab"],"pref":"ab"}' },
    { label: 'Prefix longer than some words', input: '{"words":["ab","abc","abcdefghijkl"],"pref":"abcd"}' },
    { label: 'No word starts with the prefix', input: '{"words":["xyz","pqr"],"pref":"a"}' },
    { label: 'Long run: 10 words', input: '{"words":["cba","ba","ca","ac","acaab","acbca","cabb","abaccc","accaa","bacb"],"pref":"a"}' },
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
