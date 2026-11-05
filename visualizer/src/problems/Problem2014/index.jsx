import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2014',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String s and k (JSON)',
  url: 'https://leetcode.com/problems/longest-subsequence-repeated-k-times/',
  complexity: 'Level-by-level search: each level checks every candidate with a greedy scan of s k times.',
  examples: [
    { label: 'Three repeats', input: '{"s":"abcabcabc","k":3}' },
    { label: 'Doubled letters', input: '{"s":"aabbcc","k":2}' },
    { label: 'Nothing repeats', input: '{"s":"abcd","k":2}' },
  ],
}

export default function LongestSubsequenceRepeatedKTimes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { s, k, letters, level, best } = step.snapshot
    return <>
      <p>Usable letters (appear at least {k} times in s): <strong>{letters.length ? letters.join(' ') : 'none'}</strong></p>
      <div aria-label="Candidates at this level" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {level.slice(0, 40).map((seq, i) => <span key={i} style={{
          border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', color: 'var(--text)',
          background: seq === best ? 'var(--primary-glow)' : 'transparent',
        }}>{seq || '(empty)'}</span>)}
      </div>
      {level.length > 40 && <p>{level.length - 40} more candidates are not drawn.</p>}
      <p>Best so far: <strong>{best || '(none)'}</strong>. The source is {s.length} letters long.</p>
    </>
  }} renderReasoning={() => <p>If a sequence is repeated k times in s, so is every prefix of it. The search therefore grows valid sequences one letter at a time and keeps the last valid level.</p>} />
}
