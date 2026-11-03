import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with equal-length lists a and b (JSON)',
  url: 'https://leetcode.com/problems/maximum-of-absolute-value-expression/',
  complexity: 'O(n) time for each of the four sign pairs, so O(n) overall, and O(1) extra space. The visualization caps each list at 10 entries.',
  examples: [
    { label: 'Two points', input: '{"a":[0,10],"b":[0,0]}' },
    { label: 'Only index distance', input: '{"a":[5,5,5],"b":[2,2,2]}' },
    { label: 'Mixed signs', input: '{"a":[1,4,2,-3],"b":[3,0,5,-1]}' },
  ],
}

export default function MaxAbsValueExpression() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { values, scanned, low, high, s1, s2, best } = step.snapshot
    const top = Math.max(1, ...values.map(v => Math.abs(v)))
    return <>
      <p>{s1 === null ? 'Choose a sign pair to begin.' : `Sign pair (${s1}, ${s2}) · transformed value s1*a[i] + s2*b[i] + i`}</p>
      <div role="img" aria-label="Transformed values by index" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
        {values.map((v, i) => <div key={i} data-index={i} style={{ width: 36, textAlign: 'center', fontFamily: 'monospace', fontSize: '.75rem' }}>
          <div style={{
            height: `${Math.max(4, (Math.abs(v) / top) * 130)}px`,
            background: i === scanned ? 'var(--accent, #0891b2)' : i < scanned ? 'var(--surface2)' : 'transparent',
            border: '1px solid var(--border)', opacity: i <= scanned ? 1 : 0.4,
          }} />
          <div>{v}</div>
          <div style={{ color: 'var(--text-dim)' }}>#{i}</div>
        </div>)}
      </div>
      <output aria-label="Range summary">{`Low ${low ?? '–'} · High ${high ?? '–'} · Best ${best}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Four sign pairs:</strong> each absolute value is replaced by a choice of plus or minus, and the largest of these choices is the answer.</p>
    <p><strong>One pass per pair:</strong> the largest minus the smallest transformed value is the best range for that pair. The index term is what makes the answer include the distance between positions.</p>
  </>} />
}
