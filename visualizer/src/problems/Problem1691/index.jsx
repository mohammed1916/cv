import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1691',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Boxes as [length, width, height] (JSON array)',
  url: 'https://leetcode.com/problems/maximum-height-by-stacking-cuboids/',
  complexity: 'O(n^2) time after sorting the boxes, and O(n) extra space.',
  examples: [
    { label: 'Four boxes', input: '[[3,2,1],[2,4,5],[4,1,2],[6,3,3]]' },
    { label: 'Equal boxes', input: '[[2,2,2],[2,2,2]]' },
    { label: 'Single box', input: '[[7,3,9]]' },
  ],
}

const row = (current, chain) => ({
  display: 'grid', gridTemplateColumns: '120px 1fr 110px 110px', gap: 8, alignItems: 'center', padding: '4px 8px', fontFamily: 'monospace',
  borderRadius: 6, border: `1px solid ${current ? 'var(--primary)' : 'var(--border)'}`,
  background: chain ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
})

export default function StackingCuboids() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { ordered, best, current, from, chain, boxes } = step.snapshot
    if (!ordered) return <>
      <p>Sorting the sides of each box. The largest side will be the height.</p>
      <ul style={{ fontFamily: 'monospace' }}>{(boxes ?? []).map((b, i) => <li key={i}>{b.join(' x ')}</li>)}</ul>
    </>
    const chainSet = new Set((chain ?? []).map(b => b.join('x')))
    const maxHeight = best ? Math.max(1, ...best) : 1
    return <>
      <div role="img" aria-label="Boxes in order" style={{ display: 'grid', gap: 4 }}>
        <div style={{ ...row(false, false), fontWeight: 700 }}><span>box</span><span>stack height</span><span>below</span><span>tallest</span></div>
        {ordered.map((box, i) => {
          const done = best && best[i] !== undefined
          const onChain = chainSet.has(box.join('x'))
          return <div key={i} style={row(i === current, onChain)}>
            <span>{box.join(' x ')}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span aria-hidden style={{ display: 'inline-block', height: 10, width: done ? `${(best[i] / maxHeight) * 100}%` : 0, background: 'var(--primary)' }} />
              {done ? best[i] : '-'}
            </span>
            <span>{from && from[i] >= 0 ? ordered[from[i]].join(' x ') : (done ? 'base' : '-')}</span>
            <span>{onChain ? 'in stack' : ''}</span>
          </div>
        })}
      </div>
      {chain && chain.length > 0 && <p style={{ marginTop: 10 }}>Tallest stack, bottom to top: {chain.map(b => b.join(' x ')).join(' → ')}</p>}
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Key idea:</strong> a box can sit on another only if, once both are sorted, every side fits. Boxes can be turned, so sorting each box removes the choice of orientation for that test.</p>
    <p><strong>Chain:</strong> {step.snapshot.chain ? step.snapshot.chain.map(b => b.join(' x ')).join(' then ') : 'the chain is built as the boxes are processed'}.</p>
  </>} />
}
