import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1510',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Number of stones (1 to 60)',
  url: 'https://leetcode.com/problems/stone-game-iv/',
  complexity: 'O(n√n) time: each stone count tries the square numbers up to it, and O(n) space for the win table.',
  examples: [
    { label: 'Small', input: '2' },
    { label: 'Four stones', input: '4' },
    { label: 'Nine stones', input: '9' },
  ],
}

export default function StoneGameIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { stones, k, next, win } = step.snapshot
    const cells = Array.from({ length: run.input + 1 }, (_, i) => i)
    return <>
      <div role="img" aria-label="Stone counts" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {cells.map(i => {
          const known = i < win.length && (i <= stones)
          const state = !known ? 'not yet' : win[i] ? 'win' : 'lose'
          return <div key={i} data-state={state} style={{
            minWidth: 40, padding: '4px 6px', fontFamily: 'monospace', textAlign: 'center', boxSizing: 'border-box',
            border: `${i === stones ? 2 : 1}px solid ${i === stones ? 'var(--text)' : 'var(--border)'}`,
            background: !known ? 'transparent' : win[i] ? '#bbf7d0' : '#fecaca', color: '#1c1917',
          }}><div>{i}</div><small>{state}</small></div>
        })}
      </div>
      {k !== null && k !== undefined && <p>Taking {k} × {k} = {k * k} stones leaves {next} stones.</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Positions in order.</strong> A stone count is a win when some square move leaves a losing count. Each count depends only on smaller counts, so a table filled from 0 upward is enough.</p>
    <p><strong>Stop early.</strong> Once a winning move is found, the remaining squares do not change the answer.</p>
  </>} />
}
