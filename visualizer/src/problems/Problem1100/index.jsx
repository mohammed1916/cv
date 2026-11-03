import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

function TextWindow({ snapshot }) {
  return <div aria-label="Text window" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {[...snapshot.text].map((ch, index) => {
      const inside = index >= snapshot.left && index <= snapshot.right
      return <span key={index} style={{
        border: '2px solid', borderColor: inside ? '#0891b2' : '#94a3b8', borderRadius: 6,
        padding: '4px 8px', fontFamily: 'monospace', background: inside ? 'rgba(8,145,178,0.12)' : 'transparent',
      }}>{ch}</span>
    })}
  </div>
}

export default function SlidingWindowVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <TextWindow snapshot={step.snapshot} />
      <p>Window size {step.snapshot.right >= 0 ? step.snapshot.right - step.snapshot.left + 1 : 0} of k = {step.snapshot.k} · Qualifying windows: {step.snapshot.good}</p>
      <p>Counts: {Object.entries(step.snapshot.counts).map(([ch, n]) => `${ch}×${n}`).join(' ') || 'none'}</p>
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : step.message}</output>
    </>}
    renderReasoning={() => <p>The window keeps counts only for its current letters. A size-k window is valid exactly when its count map still has k keys, so repeated letters show up as a smaller map.</p>} />
}
