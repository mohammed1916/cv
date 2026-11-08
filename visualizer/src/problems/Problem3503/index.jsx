import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No palindrome has been found yet.' },
    { id: 'piece', label: 'Piece of s', description: 'Pair this substring of s with every substring of t.' },
    { id: 'done', label: 'Complete', description: 'Report the longest palindrome length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with s and t, for example {"s": "abcde", "t": "ecdba"}',
  url: 'https://leetcode.com/problems/longest-palindrome-after-substring-concatenation-i/',
  complexity: 'O(n^2 m^2 (n + m)) for lengths n and m. The visualization uses the statement limits of 30 letters.',
  examples: [
    { label: 'Carbon and morph', input: '{"s":"carbon","t":"morph"}' },
    { label: 'Two letters swapped', input: '{"s":"ab","t":"ba"}' },
    { label: 'Repeats against three letters', input: '{"s":"zzzyy","t":"xyz"}' },
    { label: 'Eleven letters against three', input: '{"s":"mnopqrstuvw","t":"abc"}' },
    { label: 'Single letter pair', input: '{"s":"a","t":"b"}' },
    { label: 'Equal strings', input: '{"s":"abc","t":"abc"}' },
    { label: 'Longest strings', input: '{"s":"abcdefghijklmnopqrstuvwxyzabcd","t":"zyxwvutsrqponmlkjihgfedcbazyxw"}' },
    { label: 'Long run: 30 letters each', input: '{"s":"devxiiksooorropvrpjzjpqfmewnff","t":"tkaidwxtikilhxgapnguqffkfinkgo"}' },
  ],
}

export default function ConcatPalindrome() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={index => run.input.s[index]} active={-1} />
    <IndexedSequence label="t" length={run.input.t.length} valueAt={index => run.input.t[index]} active={-1} />
    <output aria-label="Best so far">{`Piece of s: "${step.piece}", best length so far ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>The palindrome is one substring of s followed by one substring of t, so every pair of pieces is a candidate.</p>
    <p>Each candidate is checked from both ends at once, and the longest one that reads the same both ways is the answer.</p>
  </>} />
}
