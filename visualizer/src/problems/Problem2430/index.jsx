import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (lowercase letters, up to 40)',
  url: 'https://leetcode.com/problems/maximum-deletions-on-a-string/',
  complexity: 'O(n^2) letter comparisons in this build (O(n^3) if each comparison is a substring check).',
  examples: [
    { label: 'Example 1', input: '{"s": "abcabcdabc"}' },
    { label: 'Example 2', input: '{"s": "aaabaab"}' },
    { label: 'Single letter', input: '{"s":"a"}' },
    { label: 'Equal letters', input: '{"s":"aaaaaa"}' },
    { label: 'Longest string', input: '{"s":"abcdefghijklmnopqrstuvwxyzabcdefghijklmn"}' },
    { label: 'Long run: 40 letters', input: '{"s":"hehumemisdtnxbmxtpljagikiejgeufcydvxpopy"}' },
  ],
}

// Letters with the current position marked. A repeat draws two blocks: the deleted prefix and the copy right after it.
function StringBlocks({ s, step }) {
  const { index, len } = step
  const first = len > 0 ? new Set(Array.from({ length: len }, (_, k) => index + k)) : new Set()
  const second = len > 0 ? new Set(Array.from({ length: len }, (_, k) => index + len + k)) : new Set()
  return <div aria-label="String" role="list" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
    {s.split('').map((ch, k) => {
      const background = first.has(k) ? 'var(--primary-glow)' : second.has(k) ? 'var(--surface3, var(--surface2))' : k === index ? 'var(--surface2)' : 'transparent'
      const border = k === index ? '2px solid var(--primary)' : '1px solid var(--border)'
      return <span key={k} role="listitem" data-index={k} style={{ width: 26, height: 30, display: 'grid', placeItems: 'center', borderRadius: 6, border, background, color: 'var(--text)', fontWeight: first.has(k) || second.has(k) ? 700 : 400 }}>
        {ch}
      </span>
    })}
  </div>
}

export default function MaximumDeletions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <StringBlocks s={run.s} step={step} />
      <p className="algorithm-readout">
        {step.len > 0
          ? `Delete the ${step.len} letters at ${step.index}; the copy after them starts at ${step.index + step.len}, so dp[${step.index}] reads dp[${step.index + step.len}].`
          : `dp[${step.index}] starts from the rule that deleting the whole rest is one operation.`}
      </p>
      <IndexedSequence label="dp: best count from each position" length={run.s.length + 1} active={step.index} valueAt={i => step.dp[i]}
        roleAt={i => (step.len > 0 && i === step.index + step.len ? 'read' : i === step.index ? 'writing' : '')} />
      <output aria-label="Best counts">{`Best counts from each position: ${step.dp.join(', ')}`}</output>
    </>
  )} renderReasoning={() => <>
    <p>Each operation removes a prefix, so the best count from a position depends only on the position after the removed prefix.</p>
    <p>Filling the table from the end lets each position reuse the answers for later positions.</p>
  </>} />
}
