import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DPDependencyView from '../../components/shared/DPDependencyView'
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

const STATE_STYLE = {
  W: 'color-mix(in srgb, var(--success) 35%, var(--surface2))',
  L: 'color-mix(in srgb, var(--warning) 35%, var(--surface2))',
}

export default function StoneGameIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { stones, k, next, win } = step.snapshot
    const cells = Array.from({ length: run.input + 1 }, (_, i) => i)
    const values = cells.map(i => (i > stones ? null : win[i] ? 'W' : 'L'))
    const sources = k !== null && k !== undefined ? [{ cell: [0, next], chosen: step.phase === 'win', note: `remove ${k} × ${k}` }] : []
    return <>
      <section aria-label="Win and lose table">
        <h3>Positions 0 to {run.input}: W wins for the player to move, L loses</h3>
        <div role="img" aria-label="Stone counts" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {cells.map(i => {
            const state = i > stones ? 'not yet' : win[i] ? 'win' : 'lose'
            return <div key={i} data-state={state} style={{
              minWidth: 40, padding: '4px 6px', fontFamily: 'monospace', textAlign: 'center', boxSizing: 'border-box', color: 'var(--text)',
              border: `${i === stones ? 2 : 1}px solid ${i === stones ? 'var(--text)' : 'var(--border)'}`,
              background: i > stones ? 'transparent' : STATE_STYLE[win[i] ? 'W' : 'L'],
              opacity: i > stones ? 0.5 : 1,
            }}><div>{i}</div><small>{state}</small></div>
          })}
        </div>
      </section>
      {sources.length > 0 && <DPDependencyView title={`Stones = ${stones}`} shape="linear" values={values} target={[0, stones]} sources={sources}
        recurrence="win[n] is true when some square k*k makes win[n - k*k] false" why="a losing position for the opponent is a winning move for us" />}
      {step.phase === 'lose' && <p>No square leaves the opponent in a losing position, so {stones} is a losing position.</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Positions in order.</strong> A stone count is a win when some square move leaves a losing count. Each count depends only on smaller counts, so a table filled from 0 upward is enough.</p>
    <p><strong>Stop early.</strong> Once a winning move is found, the remaining squares do not change the answer.</p>
  </>} />
}
