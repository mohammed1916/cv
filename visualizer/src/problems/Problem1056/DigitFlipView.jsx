import IndexedSequence from '../../components/shared/IndexedSequence'
import './DigitFlipView.css'

export default function DigitFlipView({ run, step }) {
  const digits = run.input.toString().split('')
  const flipped = step.flipped
  const failing = step.phase === 'reject'
  const roleFor = index => {
    if (index === step.current && failing) return 'rejected'
    if (flipped[index] !== null) return 'rotated'
    return ''
  }
  return (
    <figure className="dfv" aria-label="Digits of the number rotated 180 degrees, read from the last digit">
      <IndexedSequence label="number" length={digits.length} valueAt={index => digits[index]} active={step.current ?? -1} roleAt={roleFor} />
      <IndexedSequence label="rotated" length={digits.length} valueAt={index => (flipped[index] === null ? '·' : flipped[index])} active={-1} roleAt={index => (flipped[index] === null ? 'empty' : 'rotated')} />
      <p className="dfv__value" role="status">
        Rotated so far: {step.processed ? step.rotated : 0}
        {step.verdict !== null && (step.verdict ? ' · differs from the number: confusing' : ' · not confusing')}
      </p>
      <p className="dfv__rule">Allowed: 0→0, 1→1, 6→9, 8→8, 9→6. Read from the last digit, so each rotated digit lands in the mirrored position.</p>
    </figure>
  )
}
