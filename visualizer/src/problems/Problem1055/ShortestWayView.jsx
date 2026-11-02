import './ShortestWayView.css'

const PALETTE = ['piece-a', 'piece-b', 'piece-c', 'piece-d']

export default function ShortestWayView({ run, step }) {
  const { source, target } = run.input
  const next = step.next
  const pieceCount = step.pieces
  const pieces = Array.from({ length: pieceCount }, (_, index) => ({
    number: index + 1,
    letters: target.split('').filter((_, position) => step.assign[position] === index + 1).join(''),
  }))
  return (
    <figure className="sws" aria-label="Source and target letters matched piece by piece">
      <div className="sws__row">
        <span className="sws__label">source</span>
        <div className="sws__tiles">
          {source.split('').map((letter, index) => (
            <span key={index} className={`sws__tile${index === step.scan ? ' sws__tile--scan' : ''}`}>
              <b>{letter}</b><small>{index}</small>
            </span>
          ))}
          {source.length === 0 && <span className="sws__empty">empty</span>}
        </div>
      </div>
      <div className="sws__row">
        <span className="sws__label">target</span>
        <div className="sws__tiles">
          {target.split('').map((letter, index) => {
            const done = index < next
            const need = index === next && step.phase !== 'done' && step.phase !== 'stuck'
            const cls = done ? PALETTE[(step.assign[index] - 1) % PALETTE.length] : ''
            return (
              <span key={index} className={`sws__tile sws__tile--target ${cls}${need ? ' sws__tile--need' : ''}`}>
                <b>{letter}</b><small>{need ? 'next' : index}</small>
              </span>
            )
          })}
          {target.length === 0 && <span className="sws__empty">empty target</span>}
        </div>
      </div>
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
