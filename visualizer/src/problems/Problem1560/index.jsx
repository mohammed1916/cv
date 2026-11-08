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
    { label: 'Two sectors', input: '{"n":2,"rounds":[1,2]}' },
    { label: 'Full cycle', input: '{"n":3,"rounds":[1,2,3,1,2]}' },
    { label: 'Largest: n 100, 50 rounds', input: '{"n":100,"rounds":[1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100]}' },
    { label: 'Long run: 50 rounds', input: '{"n":100,"rounds":[61,37,75,91,16,20,61,91,88,28,43,45,27,100,35,92,97,77,72,60,93,60,75,39,28,69,15,43,95,61,59,14,100,9,17,36,58,93,39,71,43,76,75,25,46,44,28,5,2,11]}' },
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
            border: `${chosen.has(sector) ? 2 : 1}px solid ${chosen.has(sector) ? 'var(--primary)' : 'var(--border)'}`,
            background: entered ? 'color-mix(in srgb, var(--primary) 22%, var(--surface))' : 'transparent', color: 'var(--text)',
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
