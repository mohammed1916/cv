import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1344',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Clock time as hour:minutes',
  url: 'https://leetcode.com/problems/angle-between-hands-of-a-clock/',
  complexity: 'O(1) time and O(1) space: two angles and one comparison.',
  examples: [
    { label: 'Three o’clock', input: '3:00' },
    { label: 'Half past twelve', input: '12:30' },
    { label: 'Quarter past three', input: '3:15' },
  ],
}

const radians = deg => (deg - 90) * Math.PI / 180
const hand = (deg, length) => ({ x: 60 + length * Math.cos(radians(deg)), y: 60 + length * Math.sin(radians(deg)) })

export default function ClockAngle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { hour, minutes, hourAngle, minuteAngle, result } = step.snapshot
    const hourTip = hourAngle === undefined ? null : hand(hourAngle, 80 * 0.55)
    const minuteTip = minuteAngle === undefined ? null : hand(minuteAngle, 80 * 0.9)
    return <>
      <svg role="img" aria-label={`Clock face showing ${hour}:${String(minutes).padStart(2, '0')}`} viewBox="0 0 120 120" width="220" style={{ maxWidth: '100%' }}>
        <circle cx="60" cy="60" r="56" fill="none" stroke="var(--border)" strokeWidth="2" />
        {Array.from({ length: 12 }, (_, i) => { const p = hand(i * 30, 48); return <circle key={i} cx={p.x} cy={p.y} r="1.8" fill="var(--text)" /> })}
        {hourTip && <line x1="60" y1="60" x2={hourTip.x} y2={hourTip.y} stroke="#0891b2" strokeWidth="4" strokeLinecap="round" />}
        {minuteTip && <line x1="60" y1="60" x2={minuteTip.x} y2={minuteTip.y} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />}
        <circle cx="60" cy="60" r="2.5" fill="var(--text)" />
      </svg>
      <p>{hourAngle !== undefined ? `Hour hand ${hourAngle}° · minute hand ${minuteAngle}°` : 'Hands start at twelve for this reading.'}</p>
      {result !== undefined && <p><strong>Smaller angle:</strong> {result}°</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Two moving hands:</strong> the hour hand also advances within each hour, so its position depends on the minutes too.</p>
    <p><strong>Shorter way round:</strong> the gap can be measured either way around the dial, so the smaller of the two is the answer.</p>
  </>} />
}
