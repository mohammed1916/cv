import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ConcatPalindromeView from './ConcatPalindromeView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

export default function LongestPalindromeAfterSubstringConcatenationII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ConcatPalindromeView run={run} step={step} />} renderReasoning={() => <>
    <p>In a palindrome that crosses from s into t, the outer letters pair up: a run at the start comes from s and its mirror at the end comes from t. Whatever is left in the middle must be a palindrome by itself, and it lies wholly in whichever piece is longer.</p>
    <p>Reversing t turns the mirrored pair into two equal runs, so a common-run table finds them. A run ending at s[i-1] and r[j-1] can then take its core from the palindrome starting right after it in s, or the one right after it in r.</p>
    <p>A palindrome from one string alone has no run at all, which is why the answer starts from the largest g1 or g2.</p>
  </>} />
}
