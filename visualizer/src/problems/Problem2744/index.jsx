import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the count to zero.' },
    { id: 'check', label: 'Check word', description: 'Is its reverse already seen?' },
    { id: 'done', label: 'Complete', description: 'Return the number of pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of distinct two-letter lowercase words, JSON',
  url: 'https://leetcode.com/problems/find-maximum-number-of-string-pairs/',
  complexity: 'O(n) time with a hash set of two-letter words. The visualization caps input at 12 words.',
  examples: [
    { label: 'Example 1', input: '["cd","ac","dc","ca","zz"]' },
    { label: 'Example 2', input: '["ab","ba","cc"]' },
    { label: 'No pairs', input: '["aa","ab"]' },
  ],
}

export default function FindMaximumNumberOfStringPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Words (in order)' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>The reverse of a word is unique, so each word can have at most one partner in the list.</p>
    <p>Checking each word against earlier words counts every pair exactly once.</p>
  </>} />
}
