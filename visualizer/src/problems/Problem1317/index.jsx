import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1317',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer n',
  url: 'https://leetcode.com/problems/convert-integer-to-the-sum-of-two-no-zero-integers/',
  complexity: 'O(n × log n) time in the worst case, from checking the digits of each candidate.',
  examples: [
    { label: 'Eleven', input: '11' },
    { label: 'One hundred one', input: '101' },
    { label: 'Thousand', input: '1000' },
  ],
}

export default function NoZeroIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { n, a, b, zeroIn } = step.snapshot
    return <>
      <div aria-label="Equation" style={{ fontFamily: 'monospace', fontSize: '1.4em' }}>
        {a ?? '?'} + {b ?? '?'} = {n}
      </div>
      <p>{zeroIn !== null ? `${zeroIn} has a zero digit, so this split is rejected.` : a !== null ? 'Both parts have no zero digit.' : 'Searching...'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Search:</strong> try a from 1 upward. The first split where neither part has a zero digit is the answer.</p>
    <p><strong>Why it exists:</strong> for n of at least 2, one of the split forms always works, so the loop always finds an answer.</p>
  </>} />
}
