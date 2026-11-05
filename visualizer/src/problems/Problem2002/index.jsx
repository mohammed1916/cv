import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2002',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String s of 2 to 12 lowercase letters (JSON)',
  url: 'https://leetcode.com/problems/maximum-product-of-the-length-of-two-palindromic-subsequences/',
  complexity: 'O(2^n * n^2) time: every split of the n positions, with an O(n^2) palindrome table per side.',
  examples: [
    { label: 'Two palindromes', input: '{"s":"ababbb"}' },
    { label: 'Long runs', input: '{"s":"zaaaxbbby"}' },
    { label: 'Two letters', input: '{"s":"ab"}' },
  ],
}

export default function MaximumProductOfPalindromes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { s, split, best, bestSplit } = step.snapshot
    const side = i => (split ? (split.mask & (1 << i) ? 'A' : 'B') : '')
    const left = split ? split.left : ''
    return <>
      <div aria-label="Characters with their side" style={{ display: 'flex', gap: 4, fontFamily: 'monospace' }}>
        {[...s].map((ch, i) => <span key={i} style={{
          border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', color: 'var(--text)',
          background: side(i) === 'A' ? 'var(--primary-glow)' : side(i) === 'B' ? 'var(--surface2)' : 'transparent',
        }}>{ch}<small style={{ display: 'block', color: 'var(--text-muted)' }}>{side(i)}</small></span>)}
      </div>
      {split && <>
        <p>Subsequence A: <strong>{split.left}</strong> · Subsequence B: <strong>{split.right}</strong></p>
        {left.length > 0 && <IndexedSequence label="Side A, palindrome interval dp[l][r]" length={left.length} valueAt={i => left[i]} active={left.length - 1}
          roleAt={i => (i === 0 ? 'l' : '') + (i === left.length - 1 ? ' r' : '')} />}
      </>}
      <p>Best product so far: <strong>{best}</strong>{bestSplit ? ` from A = "${bestSplit.left}", B = "${bestSplit.right}"` : ''}.</p>
    </>
  }} renderReasoning={() => <p>Every position goes to one of the two palindromes or to neither. For each side, the longest palindrome is found by filling an interval table from the inside out, where l and r are the ends of each interval.</p>} />
}
