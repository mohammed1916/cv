import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Only the empty prefix is built.' },
    { id: 'build', label: 'Build word', description: 'Its prefix is built, so the word is built too.' },
    { id: 'skip', label: 'Skip word', description: 'Its prefix is missing.' },
    { id: 'done', label: 'Complete', description: 'Return the best buildable word.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Words (JSON array of strings)',
  url: 'https://leetcode.com/problems/longest-word-in-dictionary/',
  complexity: 'O(n log n + total length) time, dominated by the sort.',
  examples: [
    { label: 'Chain', input: '["w","wo","wor","worl","world"]' },
    { label: 'Broken chain', input: '["a","banana","app","appl","ap","apply","apple"]' },
  ],
}

export default function LongestWord() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title="Built words" items={step.built.sort((a, b) => a.length - b.length)} note={step.word ? `checking ${step.word}` : 'final'} />
    <output aria-label="Best word">Best so far: {step.best || '—'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Ordering:</strong> sorting by length guarantees every prefix is decided before the longer word that depends on it.</p>
  </>} />
}
