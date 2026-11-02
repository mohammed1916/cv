import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'No complete substrings have been counted yet.' },
    { id: 'segment', label: 'Segment', description: 'Cut the word wherever neighbours drift more than two letters apart.' },
    { id: 'window', label: 'Window', description: 'Slide a window of need times k letters across the segment.' },
    { id: 'match', label: 'Complete', description: 'Exactly need letters appear k times in this window.' },
    { id: 'done', label: 'Result', description: 'Report the number of complete substrings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with word (lowercase letters) and k (integer from 1 to 20)',
  url: 'https://leetcode.com/problems/count-complete-substrings/',
  complexity: 'O(26 * n) time after splitting, O(1) extra space. The visualization caps word at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"igigee","k":2}' },
    { label: 'Example 2', input: '{"word":"aaabbbccc","k":3}' },
  ],
}

export default function CountCompleteSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="word" length={run.input.word.length} valueAt={i => run.input.word[i]} active={step.at >= 0 ? step.at : 0}
      roleAt={i => (step.segStart !== undefined && i >= step.segStart && i < step.segEnd ? 'window' : '')} />
    <output aria-label="Complete count">{`need ${step.need || '-'}, letters at exactly k: ${step.exact}, total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A complete substring cannot cross a jump of more than two letters, so the word splits into independent segments.</p>
    <p>Inside a segment, a complete substring with need distinct letters has length need times k, so only windows of that size are checked.</p>
  </>} />
}
