import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is matched yet, with one way and no index used.' },
    { id: 'char', label: 'Match character', description: 'Each target character extends every way in either word, at a later index.' },
    { id: 'done', label: 'Return', description: 'Only ways that used both words are counted.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"word1": "...", "word2": "...", "target": "..."}',
  url: 'https://leetcode.com/problems/count-distinct-ways-to-form-target-from-two-strings/',
  complexity: 'O(|target| * |word1| * |word2|) states and transitions with a table of next-free index pairs. The visualization caps each string at 6 characters.',
  examples: [
    { label: 'Example 1', input: '{"word1":"abc","word2":"bac","target":"abc"}' },
    { label: 'Example 4', input: '{"word1":"ab","word2":"cde","target":"ace"}' },
  ],
}

export default function CountDistinctWaysTwoStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Ways so far">{`Ways after this character: ${step.ways}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A way is decided by which word supplies each target character and at which index, and within one word the indices must rise.</p>
    <p>Only the next free index in each word matters for the future, so the table keyed by those two positions counts every way exactly once.</p>
  </>} />
}
