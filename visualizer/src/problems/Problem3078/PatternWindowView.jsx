import './PatternWindowView.css'

export default function PatternWindowView({ run, step }) {
  const { board, pattern } = run.input
  const pr = pattern.length
  const pc = pattern[0].length
  const [wr, wc] = step.window || [-1, -1]
  const inWindow = (r, c) => wr >= 0 && r >= wr && r < wr + pr && c >= wc && c < wc + pc
  const cellAt = step.cell ? wr + step.cell[0] : -1
  const cellCol = step.cell ? wc + step.cell[1] : -1
  const mappingEntries = Object.entries(step.mapping)
  return (
    <div className="pwv">
      <figure className="pwv__board">
        <figcaption>Board digits{wr >= 0 ? ` · window pointer at row ${wr}, column ${wc}` : ''}</figcaption>
        <table>
          <tbody>
            {board.map((row, r) => (
              <tr key={r}>
                {row.map((v, c) => {
                  const current = r === cellAt && c === cellCol
                  return (
                    <td key={c} className={`${inWindow(r, c) ? 'is-window' : ''}${current ? ' is-current' : ''}`}>{v}</td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
      <figure className="pwv__pattern">
        <figcaption>Pattern</figcaption>
        <table>
          <tbody>
            {pattern.map((row, p) => (
              <tr key={p}>
                {[...row].map((ch, q) => (
                  <td key={q} className={step.cell && step.cell[0] === p && step.cell[1] === q ? 'is-current' : ''}>{ch}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
      <div className="pwv__map" aria-label="Letter to digit map">
        <span className="pwv__label">Letters mapped so far</span>
        {mappingEntries.length === 0 ? <span className="pwv__none">none</span> : mappingEntries.map(([ch, d]) => (
          <span key={ch} className="pwv__chip">{ch} = {d}</span>
        ))}
        <span className="pwv__label">Literal digits</span>
        <span className="pwv__none">{step.literal.length ? step.literal.join(', ') : 'none'}</span>
      </div>
      <p className="pwv__answer" role="status">{step.message} Answer: [{step.answer.join(', ')}]</p>
    </div>
  )
}
