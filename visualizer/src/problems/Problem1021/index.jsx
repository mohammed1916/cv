import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', fontFamily: 'monospace', color: 'var(--text)', textAlign: 'center' }

// Each character with its depth and whether it is kept; the current character is outlined.
export default function NestingDepthVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const s = step.snapshot.s
      let depth = 0
      const rows = [...s].map((ch, i) => {
        let keep
        if (ch === '(') { keep = depth > 0; depth += 1 } else { depth -= 1; keep = depth > 0 }
        return { ch, depth: ch === '(' ? depth - 1 : depth + 1, keep }
      })
      const sub = rows.map(r => r.depth)
      return <section aria-label="Nesting depth">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }} role="img" aria-label="Characters with depth">
          {rows.map((r, i) => <div key={i} style={{ ...cell, minWidth: 34, borderWidth: i === step.snapshot.index ? 2 : 1,
            borderColor: i === step.snapshot.index ? 'var(--text)' : 'var(--border)', background: r.keep ? 'var(--surface2)' : 'transparent' }}>
            <div style={{ fontSize: 18 }}>{r.ch}</div>
            <small>d{sub[i]}</small>
            <div style={{ fontSize: 11 }}>{r.keep ? 'keep' : 'drop'}</div>
          </div>)}
        </div>
        <p style={{ color: 'var(--text)' }}>Depth now: <strong>{step.snapshot.depth}</strong></p>
        <p style={{ color: 'var(--text)' }}>Kept so far: <code>{step.snapshot.kept || 'nothing yet'}</code></p>
      </section>
    }}
    renderReasoning={() => <p>Depth marks the primitive boundaries. A bracket is dropped only when it opens from depth zero or closes back to depth zero; every other bracket belongs to the inside of a primitive section.</p>} />
}
