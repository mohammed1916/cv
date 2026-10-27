import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bucket words', description: 'Each word waits for its first letter.' },
    { id: 'scan', label: 'Scan letter', description: 'Take the bucket for the current letter of s.' },
    { id: 'advance', label: 'Advance word', description: 'Move a word to the bucket of its next letter.' },
    { id: 'complete', label: 'Word matched', description: 'A word consumed all its letters.' },
    { id: 'done', label: 'Complete', description: 'Return the number of matched words.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 's and words (JSON)',
  url: 'https://leetcode.com/problems/number-of-matching-subsequences/',
  complexity: 'O(|s| + total word length) time; every word letter is processed at most once.',
  examples: [
    { label: 'abcde', input: '{"s":"abcde","words":["a","bb","acd","ace"]}' },
    { label: 'dsahjpjauf', input: '{"s":"dsahjpjauf","words":["ahjpjau","ja","ahbwzgqnuk","tnmlanowax"]}' },
    { label: 'repeated letters', input: '{"s":"aab","words":["aa","ab","ba","aaa"]}' },
  ],
}
export default function NumberOfMatchingSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} active={step.pos} valueAt={i => run.input.s[i]} roleAt={i => i < step.pos ? 'scanned' : ''} />
    <IndexedSequence label="Waiting buckets (letter: word@progress)" length={Math.max(step.buckets.length, 1)} valueAt={i => step.buckets[i] ?? ' '} />
    <output aria-label="Matched count">Words matched: {step.count}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Greedy matching is optimal for subsequences: a word's next letter should match the earliest occurrence. One pass over s therefore advances every word, with no per-word rescans.</p>
  </>} />
}
