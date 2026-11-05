// arr as cells; matched pieces are shaded with their piece number, the current position is marked.
export default function View({ run, step }) {
  const { arr, pieces } = run.input
  const pieceAt = []
  let pos = 0
  step.snapshot.used.forEach(index => {
    const p = pieces[index]
    for (let k = 0; k < p.length; k++) pieceAt[pos + k] = index + 1
    pos += p.length
  })
  return <div className="pieces-view">
    <ol className="pieces-view__arr" aria-label="arr">
      {arr.map((v, k) => <li key={k} data-piece={pieceAt[k] ?? ''}
        className={[k === step.i ? 'is-current' : '', pieceAt[k] ? 'is-matched' : ''].join(' ')}>
        <strong>{v}</strong>{pieceAt[k] ? <small>piece {pieceAt[k]}</small> : null}
      </li>)}
    </ol>
    <ul aria-label="Pieces">
      {pieces.map((p, k) => <li key={k} className={step.snapshot.used.includes(k) ? 'is-used' : ''}>
        piece {k + 1}: [{p.join(', ')}]
      </li>)}
    </ul>
    <p>{step.message}</p>
  </div>
}
