import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Start with no letter requirements.' },
    { id: 'need', label: 'Merge words2', description: 'Raise per-letter maximum requirements using one word of words2.' },
    { id: 'accept', label: 'Universal', description: 'The word of words1 meets every requirement.' },
    { id: 'reject', label: 'Not universal', description: 'The word of words1 is short of some letter.' },
    { id: 'done', label: 'Complete', description: 'Return the universal words.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object {words1, words2} (JSON)',
  url: 'https://leetcode.com/problems/word-subsets/',
  complexity: 'O(total letters in words1 and words2) with a 26-letter count table. Inputs are capped at 30 words of 10 letters.',
  examples: [
    { label: 'Example 1', input: '{"words1":["amazon","apple","facebook","google","leetcode"],"words2":["e","o"]}' },
    { label: 'Example 2', input: '{"words1":["amazon","apple","facebook","google","leetcode"],"words2":["l","e"]}' },
    { label: 'Repeated letters', input: '{"words1":["warrior","world","tower"],"words2":["wr","or","rr"]}' },
  ],
}

export default function WordSubsets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="words2 (merged into requirements)" length={run.input.words2.length} active={step.b} valueAt={i => run.input.words2[i]} roleAt={i => i < step.b ? 'merged' : ''} />
    <IndexedSequence label="Required letter counts (max over words2)" length={step.need.length} valueAt={i => `${step.need[i].ch} x${step.need[i].n}`} />
    <IndexedSequence label="words1" length={run.input.words1.length} active={step.word} valueAt={i => run.input.words1[i]}
      roleAt={i => step.passed.includes(i) ? 'universal' : step.failed.includes(i) ? 'rejected' : ''} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A word contains every word of words2 as a multiset subset exactly when, for each letter, it has at least the largest count any word of words2 needs.</p>
  </>} />
}
