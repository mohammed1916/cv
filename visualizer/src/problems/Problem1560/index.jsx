import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1560',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and rounds (JSON)',
  url: 'https://leetcode.com/problems/most-visited-sector-in-a-circular-track/',
  complexity: 'O(n + m) time for the simulation view, O(1) for the formula; the answer needs only the first and last rounds.',
  examples: [
    { label: 'No wrap', input: '{"n":6,"rounds":[2,4,5,6,1,3]}' },
    { label: 'Wrap past the end', input: '{"n":8,"rounds":[7,1,2,3]}' },
    { label: 'Single sector', input: '{"n":4,"rounds":[1,4,1]}' },
  ],
}

export default function MostVisitedSector() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n } = run.input
    const { visits, segment, answer } = step.snapshot
    const top = Math.max(0, ...visits)
    const chosen = new Set(answer ?? [])
    return <>
      <div role="img" aria-label="Circular track with visit counts" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Array.from({ length: n }, (_, i) => {
          const sector = i + 1
          const entered = segment?.entered?.includes(sector)
          return <div key={sector} data-sector={sector} style={{
            minWidth: 56, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${chosen.has(sector) ? 2 : 1}px solid ${chosen.has(sector) ? '#0891b2' : 'var(--border)'}`,
            background: entered ? '#a5f3fc' : 'transparent', color: 'var(--text)',
          }}><div>sector {sector}</div><small>visits: {visits[i]}{visits[i] === top && top > 0 ? ' (max)' : ''}</small></div>
        })}
      </div>
      <p>{segment ? `Segment ${segment.from} to ${segment.to}.` : 'The run has not moved yet.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> the sectors on the clockwise stretch from the first round's sector to the last round's sector are the only busy ones; every other sector is passed fewer times.</p>
    <p><strong>Wrap case:</strong> if the finish sits before the start in numbering, the run passed sector n and returned to 1, so the answer splits into 1 to finish and start to n.</p>
  </>} />
}
