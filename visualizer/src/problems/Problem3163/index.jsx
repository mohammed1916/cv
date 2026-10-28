import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the first letter with an empty result.' },
    { id: 'chunk', label: 'Write run', description: 'Count the copies of one letter, at most nine, and write the count then the letter.' },
    { id: 'done', label: 'Complete', description: 'Return the compressed word.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Word (JSON object with word)',
  url: 'https://leetcode.com/problems/string-compression-iii/',
  complexity: 'O(n) time and O(n) output space. The visualization caps input at 40 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"abcde"}' },
    { label: 'Long run', input: '{"word":"aaaaaaaaaaaaaaabc"}' },
  ],
}

export default function StringCompressionIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Word" length={run.input.word.length} valueAt={i => run.input.word[i]} active={step.start}
      roleAt={i => (i >= step.start && i < step.start + step.length ? 'read' : '')} />
    <output aria-label="Result so far">{`Result so far: ${step.result || '(empty)'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Runs are cut at nine letters, so a longer run is written as several chunks, each with its own count.</p>
  </>} />
}
