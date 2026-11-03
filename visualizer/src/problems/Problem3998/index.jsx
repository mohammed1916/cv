import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PrefixRaceView from './PrefixRaceView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3998',
  phases: [
    { id: 'start', label: 'Setup', description: 'Count the zeros in s.' },
    { id: 'count', label: 'Count', description: 'Compare the pattern with the required zero count.' },
    { id: 'reject', label: 'Reject', description: 'The pattern cannot have the right zero count or prefix race.' },
    { id: 'fill', label: 'Fill', description: 'Place zeros on the earliest question marks.' },
    { id: 'check', label: 'Prefix', description: 'Zeros of the candidate stay ahead of s.' },
    { id: 'fail', label: 'Fail', description: 'A prefix falls behind.' },
    { id: 'accept', label: 'Accept', description: 'The candidate is reachable.' },
    { id: 'done', label: 'Result', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and patterns (e.g. {"s":"1010","patterns":["0?1?","11??"]})',
  url: 'https://leetcode.com/problems/transform-binary-string-using-subsequence-sort/',
  complexity: 'O(n) time per pattern, so O(n * p) overall for p patterns. The visualization caps s at 12 characters and patterns at 5.',
  examples: [
    { label: 'Three patterns', input: '{"s":"1010","patterns":["0?1?","11??","??0?"]}' },
    { label: 'Zero counts', input: '{"s":"0000","patterns":["1111","0?0?"]}' },
  ],
}

export default function TransformBinaryStringSubsequenceSort() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <PrefixRaceView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Sorting a chosen subsequence only moves zeros toward the front, so each prefix can gain zeros but never lose them.</p>
    </>} />
}
