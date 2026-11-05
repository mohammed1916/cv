import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2000',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Word and character (JSON)',
  url: 'https://leetcode.com/problems/reverse-prefix-of-word/',
  complexity: 'O(n) time and O(n) space for the character copy.',
  examples: [
    { label: 'Boundary late', input: '{"word":"leetcode","ch":"e"}' },
    { label: 'Absent letter', input: '{"word":"example","ch":"z"}' },
    { label: 'Boundary first', input: '{"word":"treasure","ch":"t"}' },
  ],
}

export default function ReversePrefixOfWord() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { chars, left, right, boundary, ch } = step.snapshot
    return <>
      <IndexedSequence label={`Word, reversing up to the first ${ch}`} length={chars.length} valueAt={i => chars[i]} active={right >= 0 ? right : boundary}
        roleAt={i => (i === left && left >= 0 ? 'l' : '') + (i === right && right >= 0 ? ' r' : '') + (i === boundary && boundary >= 0 && right < 0 ? 'boundary' : '')} />
      <p>{boundary >= 0 ? `Boundary at index ${boundary}.` : `${ch} does not occur, so nothing changes.`} {left >= 0 ? `Pointers: l = ${left}, r = ${right}.` : ''}</p>
    </>
  }} renderReasoning={() => <p>Only the prefix up to the first occurrence changes. Two pointers swap symmetric positions inside that prefix until they meet.</p>} />
}
