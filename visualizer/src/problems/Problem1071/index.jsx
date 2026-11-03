import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1071',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with first and second uppercase strings',
  url: 'https://leetcode.com/problems/greatest-common-divisor-of-strings/',
  complexity: 'O(n + m) for the concatenation check and O(log(min(n, m))) Euclid steps on the lengths, where n and m are the string lengths.',
  examples: [
    { label: 'Triple base', input: '{"first":"ABCABC","second":"ABC"}' },
    { label: 'Two-letter base', input: '{"first":"ABABAB","second":"ABAB"}' },
    { label: 'No shared base', input: '{"first":"LEET","second":"CODE"}' },
  ],
}

export default function RepeatedBase() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { first, second, a, b, joinedFirst, joinedSecond } = step.state
    const matches = joinedFirst === joinedSecond
    return <div style={{ fontFamily: 'monospace' }}>
      <p><strong>first + second</strong> = {joinedFirst}</p>
      <p><strong>second + first</strong> = {joinedSecond}</p>
      <p aria-label="Order check">{matches ? 'The two orders match.' : 'The two orders differ.'}</p>
      {matches && <p aria-label="Current lengths">Lengths: a = {a}, b = {b}</p>}
    </div>
  }} renderReasoning={() => <>
    <p><strong>Commuting test:</strong> if the two joined orders are equal, both strings are built from one common block.</p>
    <p><strong>Largest block:</strong> the block length must divide both lengths, so the largest one is their greatest common divisor, found with Euclid.</p>
  </>} />
}
