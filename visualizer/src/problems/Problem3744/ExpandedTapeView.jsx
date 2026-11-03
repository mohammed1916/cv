import './ExpandedTapeView.css'

// The expanded string as a tape of cells, one group per word. Groups already skipped are dimmed,
// the group being read is outlined, and the target index k is marked with a pointer.
export default function ExpandedTapeView({ run, step }) {
  if (!run || !step) return <section className="et-view"><p className="et-empty">Press Play to walk the expanded string.</p></section>
  const { words, k } = run.input
  let offset = 0
  const groups = words.map((word, w) => {
    const cells = []
    for (let t = 0; t < word.length; t += 1) {
      for (let rep = 0; rep <= t; rep += 1) {
        cells.push({ letter: word[t], index: offset })
        offset += 1
      }
    }
    const group = { word, w, cells }
    if (w < words.length - 1) {
      cells.push({ letter: ' ', index: offset, space: true })
      offset += 1
    }
    return group
  })
  const current = step.word
  return (
    <section className="et-view" aria-label="Expanded string tape">
      {groups.map(group => {
        const classes = ['et-group']
        if (current === group.w) classes.push('et-group--current')
        if (current > group.w) classes.push('et-group--passed')
        return (
          <div key={group.w} className={classes.join(' ')}>
            <span className="et-word">{`word ${group.w + 1}: "${group.word}"`}</span>
            <div className="et-cells">
              {group.cells.map(cell => {
                const cls = ['et-cell']
                if (cell.space) cls.push('et-cell--space')
                if (cell.index === k) cls.push('et-cell--target')
                return <span key={cell.index} className={cls.join(' ')} title={`index ${cell.index}`}>{cell.space ? '␣' : cell.letter}</span>
              })}
            </div>
          </div>
        )
      })}
      <div className="et-readout">
        <span>{`target index k = ${k}`}</span>
        <span>{step.phase === 'done' ? `answer "${step.letter}"` : `position left in this word: ${step.position}`}</span>
      </div>
      <p className="et-key">Each word of length m expands to m(m + 1) / 2 cells: the t-th letter repeats t times. Outlined: the word being read. Ringed cell: index k.</p>
    </section>
  )
}
