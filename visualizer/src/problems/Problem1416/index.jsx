import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'The empty prefix has one split.' },
    { id: 'piece', label: 'Last piece', description: 'A last number no larger than k, with no leading zero, adds the ways before it.' },
    { id: 'done', label: 'Complete', description: 'Report the ways for the whole string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (digits) and k (JSON)',
  url: 'https://leetcode.com/problems/restore-the-array/',
  complexity: 'O(n^2) time and O(n) space. The visualization caps s at 12 digits and k at 10000.',
  examples: [
    { label: 'Example 1', input: '{"s":"1000","k":10000}' },
    { label: 'Example 2', input: '{"s":"1317","k":2000}' },
  ],
}

export default function RestoreTheArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Ways to split each prefix" length={step.ways.length} valueAt={i => step.ways[i]} active={step.end}
      roleAt={i => (step.start >= 0 && i === step.start ? 'start' : '')} />
    <output aria-label="Piece">{step.start >= 0 ? `Piece ${run.input.s.slice(step.start, step.end)}` : `Digits ${run.input.s}`}</output>
  </>} renderReasoning={() => <>
    <p>Every number in the split must be between 1 and k and cannot start with a zero, so each cut is checked against the piece before it.</p>
    <p>The ways to split a prefix add up over every valid last piece, which is why a single table over prefix length is enough.</p>
  </>} />
}
