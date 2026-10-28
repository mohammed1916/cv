import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty prefix holds no substrings.' },
    { id: 'prefix', label: 'Prefix', description: 'Extend the best count to the prefix ending at this letter.' },
    { id: 'done', label: 'Complete', description: 'Report the best count for the whole word.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with word (JSON)',
  url: 'https://leetcode.com/problems/find-maximum-number-of-non-intersecting-substrings/',
  complexity: 'O(n^2) time and O(n) space. The visualization caps the word at 14 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"abcdeafdef"}' },
    { label: 'Example 2', input: '{"word":"bcdaaaab"}' },
  ],
}

export default function NonIntersectingSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Word" length={run.input.word.length} valueAt={i => run.input.word[i]} active={step.at ?? -1} />
    <output aria-label="Best">{`Best count so far: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A substring that starts and ends with the same letter can end at the current position, so the prefix count only needs the best earlier prefix.</p>
  </>} />
}
