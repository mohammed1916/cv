import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: 'https://leetcode.com/problems/minimum-cost-to-move-chips-to-the-same-position/',
}

const chip = { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: 44, padding: '6px 0', borderRadius: 6, border: '1px solid var(--border)', fontFamily: 'monospace', marginRight: 6 }

export default function MinimumCostToMoveChips() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, even, odd, target } = step.snapshot
    return <>
      <div aria-label="Chips" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
        {run.input.map((p, i) => {
          const isEven = p % 2 === 0
          const shown = i <= index
          const paying = target !== undefined && target !== (isEven ? 'even' : 'odd')
          return <span key={i} data-position={p} style={{
            ...chip,
            background: !shown ? 'transparent' : isEven ? 'rgba(8,145,178,.18)' : 'rgba(245,158,11,.2)',
            opacity: shown ? 1 : 0.4,
            borderStyle: paying ? 'dashed' : 'solid',
          }}><strong>{p}</strong><small>{isEven ? 'even' : 'odd'}</small></span>
        })}
      </div>
      <p aria-label="Parity counts">Even: {even} · Odd: {odd}{target ? ` · Gather on ${target}` : ''}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Why parity:</strong> moving a chip by two costs nothing, so every chip can slide to any position with the same parity. Only the parity change costs 1, and it is cheapest to move the smaller group.</p>
    {step.snapshot.cost !== undefined && <p>Cost of this choice: {step.snapshot.cost}.</p>}
  </>} />
}
