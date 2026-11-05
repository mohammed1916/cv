import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SpanTextView from './SpanTextView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '1065',
  phases: [
    { id: 'start', label: 'Start', description: 'No pairs found yet.' },
    { id: 'position', label: 'Position', description: 'Try every word at this start.' },
    { id: 'miss', label: 'Miss', description: 'The word does not begin here.' },
    { id: 'hit', label: 'Hit', description: 'The word begins here.' },
    { id: 'duplicate', label: 'Duplicate', description: 'This pair is already recorded.' },
    { id: 'record', label: 'Record', description: 'Add the new pair.' },
    { id: 'sort', label: 'Sort', description: 'Order by start, then end.' },
    { id: 'done', label: 'Result', description: 'Report every pair.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with text and words (non-empty strings)',
  url: 'https://leetcode.com/problems/index-pairs-of-a-string/description/',
  complexity: 'O(n * W * L) time for text length n, W words and longest word length L, plus a sort of the pairs; O(p) space for p pairs. The visualization caps text at 30 characters, 8 words and 10 characters per word; the official bounds are not verified.',
  examples: [
    { label: 'Three words', input: '{"text":"abracadabra","words":["abra","cad","ra"]}' },
    { label: 'Overlapping', input: '{"text":"aaaa","words":["aa"]}' },
    { label: 'No match', input: '{"text":"abc","words":["x","y"]}' },
  ],
}

export default function IndexPairsOfAString() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SpanTextView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Every start position is tried against every word, so overlapping occurrences are all found; the final sort puts the spans in order.</p>}
    />
  )
}
