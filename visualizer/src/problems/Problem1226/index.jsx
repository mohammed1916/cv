import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const SIZE = 280
const CENTER = SIZE / 2

// Read "fork f: held by p" / "fork f: free" from the frame's fork lines.
function holdersOf(state, n) {
  const holders = Array(n).fill(null)
  state.forEach((line, f) => {
    const match = /held by (\d+)/.exec(line)
    if (match) holders[f] = Number(match[1])
  })
  return holders
}

const place = (angle, radius, width, height) => ({
  left: CENTER + radius * Math.cos(angle) - width / 2,
  top: CENTER + radius * Math.sin(angle) - height / 2,
})

const definition = {
  number: '1226',
  phases: [
    { id: 'start', label: 'Table', description: 'All forks start on the table.' },
    { id: 'eat', label: 'Eat', description: 'Both forks were free, so the philosopher takes them in order.' },
    { id: 'wait', label: 'Wait', description: 'A neighbouring fork is in use.' },
    { id: 'finish', label: 'Finish', description: 'The philosopher puts both forks back.' },
    { id: 'done', label: 'Result', description: 'Show the event log.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n philosophers and events: ["hungry", p] or ["finish", p]',
  url: 'https://leetcode.com/problems/the-dining-philosophers/',
  complexity: 'O(1) per event with one fork per seat. Taking the lower numbered fork first removes the circular wait.',
  examples: [
    { label: 'Ordered', input: '{"n":3,"events":[["hungry",0],["hungry",1],["hungry",2],["finish",0],["hungry",1],["finish",1],["hungry",2],["finish",2]]}' },
  ],
}

export default function TheDiningPhilosophers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.n
    const holders = holdersOf(step.state, n)
    const eating = new Set(holders.filter(h => h !== null))
    const waitingMatch = /^(\d+) waits/.exec(step.message)
    const waiting = waitingMatch ? Number(waitingMatch[1]) : null
    const log = step.phase === 'done' ? run.result : null
    return <>
      <div aria-label="Round table" role="img" style={{ position: 'relative', width: SIZE, height: SIZE, maxWidth: '100%', margin: '0 auto' }}>
        <div style={{ position: 'absolute', ...place(0, 0, 0, 0), left: CENTER - 40, top: CENTER - 20, width: 80, height: 40, borderRadius: 40, border: '1px solid var(--border)', background: 'var(--surface2)' }} />
        {Array.from({ length: n }, (_, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2
          const isEating = eating.has(i)
          const isWaiting = waiting === i
          return <div key={`p${i}`} data-philosopher={i} data-state={isEating ? 'eating' : isWaiting ? 'waiting' : 'thinking'} style={{
            position: 'absolute', ...place(angle, 96, 56, 32), width: 56, height: 32, boxSizing: 'border-box',
            display: 'grid', placeItems: 'center', fontFamily: 'monospace', color: 'var(--text)',
            border: isWaiting ? '2px dashed var(--text)' : '1px solid var(--border)',
            background: isEating ? 'color-mix(in srgb, var(--primary) 30%, transparent)' : 'var(--surface2)',
          }}>P{i}{isEating ? ' eats' : isWaiting ? ' waits' : ''}</div>
        })}
        {holders.map((holder, f) => {
          const angle = (2 * Math.PI * f) / n - Math.PI / 2 - Math.PI / n
          return <div key={`f${f}`} data-fork={f} data-holder={holder ?? 'free'} style={{
            position: 'absolute', ...place(angle, 58, 44, 22), width: 44, height: 22, boxSizing: 'border-box',
            display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: 12, color: 'var(--text)',
            border: holder === null ? '1px solid var(--border)' : '2px solid var(--text)',
          }}>f{f}{holder === null ? '' : `:P${holder}`}</div>
        })}
      </div>
      <p style={{ color: 'var(--text-dim)' }}>Each philosopher needs the fork numbered as their own seat and the next one.</p>
      <output aria-label="Current step">{step.message}</output>
      {log && <p aria-label="Event log">Log: {log.join(' · ')}</p>}
    </>
  }} renderReasoning={() => <>
    <p>Each philosopher needs the fork on the left and the fork on the right. If every philosopher holds one fork and waits for the other, nobody can eat.</p>
    <p>Always taking the lower numbered fork first breaks that circle, because the highest numbered fork can never be waited on by a philosopher holding a lower one.</p>
  </>} />
}
