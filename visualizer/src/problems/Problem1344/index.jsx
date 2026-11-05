import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1344', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Time as h:mm',
  url: 'https://leetcode.com/problems/angle-between-hands-of-a-clock/',
  complexity: 'O(1) time and O(1) space.',
}

function Dial({ hourHand, minuteHand }) {
  const point = (deg, len) => {
    const rad = (deg - 90) * Math.PI / 180
    return [110 + len * Math.cos(rad), 110 + len * Math.sin(rad)]
  }
  const [hx, hy] = point(hourHand, 60)
  const [mx, my] = point(minuteHand, 90)
  return <svg viewBox="0 0 220 220" role="img" aria-label={`Clock hands at ${Math.round(hourHand)} and ${Math.round(minuteHand)} degrees`} style={{ maxWidth: 220, width: '100%' }}>
    <circle cx="110" cy="110" r="100" fill="none" stroke="var(--border)" strokeWidth="2" />
    <line x1="110" y1="110" x2={hx} y2={hy} stroke="var(--text)" strokeWidth="6" strokeLinecap="round" />
    <line x1="110" y1="110" x2={mx} y2={my} stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
    <circle cx="110" cy="110" r="4" fill="var(--text)" />
  </svg>
}

export default function ClockAngleVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <Dial hourHand={s.hourHand} minuteHand={s.minuteHand} />
      <StackLane title="Angles (degrees from twelve)" items={[`hour hand ${s.hourHand}`, `minute hand ${s.minuteHand}`]} note={s.direct !== undefined ? `gap ${s.direct}` : undefined} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Two moving hands:</strong> the hour hand also drifts with the minutes, so its angle is 30 degrees per hour plus half a degree per minute.</p>
    <p>{step.message}</p>
  </>} />
}
