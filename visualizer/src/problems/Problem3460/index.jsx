import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LcpRemovalView from './LcpRemovalView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3460',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with first and second lowercase strings',
  url: 'https://leetcode.com/problems/longest-common-prefix-after-at-most-one-removal/',
  complexity: 'O(n^2) time and O(1) extra space for strings of length n: the removal index scans up to the shared prefix, and each scan can compare up to n letters. The visualization caps each string at 20 letters.',
  examples: [
    { label: 'Gap closed', input: '{"first":"abxcd","second":"abcd"}' },
    { label: 'No help', input: '{"first":"xyz","second":"abc"}' },
    { label: 'Second ends early', input: '{"first":"mnop","second":"mn"}' },
    { label: 'Single letter each', input: '{"first":"a","second":"a"}' },
    { label: 'Equal strings tie', input: '{"first":"abc","second":"abc"}' },
    { label: 'Longest reversed', input: '{"first":"abcdefghijklmnopqrst","second":"tsrqponmlkjihgfedcba"}' },
    { label: 'Long run: 20 letters', input: '{"first":"gzwgmqxruqgssxplnnfp","second":"otsgyamtcikhkmriohyq"}' },
  ],
}

export default function LongestCommonPrefixAfterRemovalVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LcpRemovalView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
