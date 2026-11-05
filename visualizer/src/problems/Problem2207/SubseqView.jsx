// The text is drawn with the pattern letters highlighted. Pair counts build up as each second-letter match is read.
export default function SubseqView({ run, step }) {
  const { text, pattern } = run.input
  return (
    <div className="subseq-view">
      <div className="subseq-text" role="img" aria-label={`Text ${text}`}>
        {text.split('').map((c, i) => <div key={i} className={`subseq-cell${c === pattern[0] ? ' is-first' : ''}${c === pattern[1] ? ' is-second' : ''}${i === step.index ? ' is-current' : ''}`}>
          <small>{i}</small><strong>{c}</strong>
        </div>)}
      </div>
      <p>Pattern <strong>{pattern}</strong>: earlier {pattern[0]} seen so far: <strong>{step.seen0}</strong>. Pairs: <strong>{step.pairs}</strong>.</p>
      {step.total0 !== undefined && <p>Adding one {step.total0 >= step.total1 ? pattern[0] : pattern[1]} at the {step.total0 >= step.total1 ? 'start' : 'end'} adds {Math.max(step.total0, step.total1)} more.</p>}
    </div>
  )
}
