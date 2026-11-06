import './RepeatGridView.css'
import IndexedSequence from '../../components/shared/IndexedSequence'

export default function RepeatGridView({ run, step }) {
  const { s, n } = step
  const cells = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => j))
  const bestLen = step.best
  const highlightRow = step.i
  const highlightCol = step.j
  return (
    <>
    <IndexedSequence label="String s with pointers i and j" length={s.length} valueAt={k => s[k]} active={highlightRow ?? -1} roleAt={k => (k === highlightRow ? 'i' : k === highlightCol ? 'j' : '')} />
    <figure className="rgv1062" aria-label="Table comparing each pair of positions in the string">
      <div className="rgv1062__scroll">
        <table className="rgv1062__grid">
          <thead>
            <tr>
              <th aria-label="row letter" />
              {s.split('').map((ch, j) => <th key={j} className={j === highlightCol ? 'rgv1062__hot' : ''}><span>{ch}</span><small>{j}</small></th>)}
            </tr>
          </thead>
          <tbody>
            {cells.map((row, i) => (
              <tr key={i}>
                <th className={i === highlightRow ? 'rgv1062__hot' : ''}><span>{s[i]}</span><small>{i}</small></th>
                {row.map(j => {
                  if (j <= i) return <td key={j} className="rgv1062__blank" />
                  const value = step.run[i][j]
                  const known = step.known[i][j]
                  const isNow = i === highlightRow && j === highlightCol && step.phase !== 'done'
                  const isBest = step.bestCell && step.bestCell[0] === i && step.bestCell[1] === j
                  const match = s[i] === s[j]
                  return (
                    <td key={j}
                      className={[
                        'rgv1062__cell',
                        known && match ? 'rgv1062__cell--match' : '',
                        known && !match ? 'rgv1062__cell--miss' : '',
                        isNow ? 'rgv1062__cell--now' : '',
                        isBest ? 'rgv1062__cell--best' : '',
                      ].join(' ')}
                      aria-label={`run ${i},${j} = ${known ? value : 'not yet'}`}>
                      {known ? value : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rgv1062__status" role="status">
        Best so far: {bestLen}{step.bestCell ? ` · "${s.slice(step.bestCell[0] - bestLen + 1, step.bestCell[0] + 1)}"` : ''}
      </p>
      <p className="rgv1062__legend">Each cell (i, j) with i below j counts equal letters ending at i and j. Green = letters match, red = they differ, gold = best run so far.</p>
    </figure>
    </>
  )
}
