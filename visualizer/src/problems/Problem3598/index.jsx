import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pairs', description: 'Measure the shared prefix of each neighbouring pair.' },
    { id: 'remove', label: 'Remove', description: 'Combine the pairs that survive the removal with the one new pair it creates.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (JSON array of strings)',
  url: 'https://leetcode.com/problems/longest-common-prefix-between-adjacent-strings-after-removals/',
  complexity: 'O(total length) time with prefix and suffix maxima. The visualization caps the list at 8 words.',
  examples: [
    { label: 'Example 1', input: '{"words":["jump","run","run","jump","run"]}' },
    { label: 'Example 2', input: '{"words":["dog","racer","car"]}' },
  ],
}

export default function AdjacentPrefixAfterRemovals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.input.words.length} valueAt={i => run.input.words[i]} active={step.removed ?? -1} roleAt={i => (i === step.removed ? 'removed' : '')} />
    <output aria-label="Answers">{`Answers so far: ${step.answer.join(', ') || 'none'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Removing index r breaks the pairs on both sides of it and creates one new pair from its neighbours, so only that pair needs fresh work.</p>
  </>} />
}
