import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1943',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of [start, end, colour] segments (e.g. [[1,4,5],[1,7,7]])',
  url: 'https://leetcode.com/problems/describe-the-painting/',
  complexity: 'O(k log k) for k endpoints: sort the endpoints and sweep once.',
  examples: [
    { label: 'Overlap', input: '[[1,4,5],[1,7,7]]' },
    { label: 'Gap between', input: '[[1,3,2],[4,6,9]]' },
    { label: 'Single segment', input: '[[1,2,1]]' },
    { label: 'Touching at a point', input: '[[1,3,1],[3,5,2]]' },
    { label: 'Long run: six segments', input: '[[1,14,1],[2,14,2],[3,6,3],[5,18,4],[7,16,5],[8,16,6]]' },
  ],
}

const MAX = 20

export default function Problem1943Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const lo = Math.min(...run.input.segments.map(s => s[0]))
      const hi = Math.max(...run.input.segments.map(s => s[1]))
      const cols = Array.from({ length: hi - lo }, (_, i) => lo + i)
      return <>
        <div aria-label="Number line" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 28px)`, gap: 2 }}>
          {cols.map(x => {
            const seg = run.input.segments.filter(([s, e]) => x >= s && x < e)
            const inPart = step.painting.find(([s, e]) => x >= s && x < e)
            const current = step.left !== null && x >= step.left && x < step.right
            return <div key={x} style={{ textAlign: 'center', fontSize: '.7rem' }}>
              <div style={{ height: 16, borderRadius: 3, background: current ? 'var(--primary)' : 'transparent', color: 'var(--text)', fontWeight: 700, fontSize: '.7rem', textAlign: 'center' }}>{current && x === step.left ? 'l' : current && x === step.right - 1 ? 'r' : ''}</div>
              <div style={{ height: 12 * Math.max(1, seg.length), background: 'color-mix(in srgb, var(--success) 25%, var(--surface2))', border: '1px solid var(--border)', opacity: seg.length ? 1 : 0.15, borderRadius: 3 }} />
              <div style={{ marginTop: 2 }}>{x}</div>
              {inPart && <small style={{ color: 'var(--text-muted)' }}>{inPart[2]}</small>}
            </div>
          })}
        </div>
        <p>Columns show each unit of the number line; the bars count the segments covering it. The shaded interval between the pointers l and r is being swept. Max coordinate: {MAX}.</p>
        <p>Painting so far: <strong>{step.painting.map(([s, e, m]) => `[${s}, ${e}) = ${m}`).join('  ') || 'none yet'}</strong></p>
        {step.result !== undefined && <output aria-label="Painting">Result: {JSON.stringify(step.result)}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
