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
  question: "Count how many of the given words are subsequences of string s.",
  approaches: [
    { name: "Waiting buckets", intuition: "Keep each word in a bucket keyed by the next letter it needs; scanning s moves each word to its next bucket.", time: "O(|s| + total word length)", space: "O(total word length)" },
    { name: "Per-letter index lists with binary search", intuition: "For each word, find the next occurrence of each letter with binary search in the position list of s.", time: "O(words * length * log |s|)", space: "O(|s|)" },
  ],
  examples: [
    { label: 'abcde', input: '{"s":"abcde","words":["a","bb","acd","ace"]}' },
    { label: 'dsahjpjauf', input: '{"s":"dsahjpjauf","words":["ahjpjau","ja","ahbwzgqnuk","tnmlanowax"]}' },
    { label: 'repeated letters', input: '{"s":"aab","words":["aa","ab","ba","aaa"]}' }, { label: 'Single letter word', input: '{"s":"a","words":["a"]}' }, { label: 'Duplicate words count twice', input: '{"s":"abc","words":["ab","ab","c"]}' }, { label: 'No matches', input: '{"s":"abc","words":["d"]}' }, { label: 'Long run: 40 letters, 10 words', input: '{"s":"caaaabbacbababcababbbcaaacccaaacaaaacccc","words":["aa","ab","ab","bbb","acb","cca","bcc","bc","bbb","cac"]}' },
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
