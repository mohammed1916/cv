// Each word is a row. The prefix letters are highlighted; the current word is outlined.
export default function WordListView({ run, step }) {
  const { words, pref } = run.input
  return (
    <div className="word-list-view">
      <p>Prefix: <strong>{pref}</strong></p>
      <ol className="word-list" aria-label="Words">
        {words.map((word, i) => {
          const checked = step.index >= i || step.phase === 'done'
          const head = word.slice(0, pref.length)
          const hit = checked && word.startsWith(pref)
          return <li key={i} className={`word-row${i === step.index ? ' is-current' : ''}${hit ? ' is-hit' : ''}`}>
            <span className="word-head">{checked ? head : ''}</span><span className="word-tail">{word.slice(pref.length)}</span>
            {checked && <small>{hit ? 'counts' : 'no'}</small>}
          </li>
        })}
      </ol>
      <p>Words that start with the prefix so far: <strong>{step.ans}</strong></p>
    </div>
  )
}
