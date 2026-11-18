import './ShortestWayView.css'
import IndexedSequence from '../../components/shared/IndexedSequence'

const PALETTE = ['piece-a', 'piece-b', 'piece-c', 'piece-d']

export default function ShortestWayView({ run, step }) {
  const { source, target } = run.input
  const next = step.next
  const pieceCount = step.pieces
  const pieces = Array.from({ length: pieceCount }, (_, index) => ({
    number: index + 1,
    letters: target.split('').filter((_, position) => step.assign[position] === index + 1).join(''),
  }))
  const targetNeed = step.phase !== 'done' && step.phase !== 'stuck' ? next : -1
  return (
    <figure className="sws" aria-label="Source and target letters matched piece by piece">
      <IndexedSequence
        label="source"
        length={source.length}
        valueAt={index => source[index]}
        active={step.scan}
        roleAt={index => (index === step.scan ? 'scanning' : '')}
      />
      <IndexedSequence
        label="target"
        length={target.length}
        valueAt={index => target[index]}
        active={targetNeed}
        roleAt={index => (index < next ? `piece ${step.assign[index]}` : index === targetNeed ? 'next' : '')}
      />
      <div className="sws__pieces" aria-label="Pieces so far">
        {pieces.length === 0 && <span className="sws__chip">no pieces yet</span>}
        {pieces.map(piece => (
          <span key={piece.number} className={`sws__chip ${PALETTE[(piece.number - 1) % PALETTE.length]}`}>
            piece {piece.number}: {piece.letters || '(none)'}
          </span>
        ))}
      </div>
      <figcaption className="sws__count">
        {step.phase === 'done' && run.result === -1 ? 'Result: -1, impossible' : `Pieces: ${pieceCount}`}
      </figcaption>
    </figure>
  )
}
