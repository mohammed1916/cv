import './SpanTextView.css'

const LANE_COLORS = ['lane-a', 'lane-b', 'lane-c', 'lane-d', 'lane-e', 'lane-f']

export default function SpanTextView({ run, step }) {
  const { text, words } = run.input
  const cand = step.candidate
  const laneOf = word => words.indexOf(word) % LANE_COLORS.length
  const lanes = words.map((word, index) => ({ word, index }))
  return (
    <figure className="stv" aria-label="Text positions with every matched word span">
      <div className="stv__text" aria-label="Characters of the text with indices">
        {text.split('').map((ch, i) => {
          const inCandidate = cand && i >= cand[0] && i <= cand[1]
          const isStart = step.start === i
          return (
            <span key={i} className={`stv__char${isStart ? ' stv__char--start' : ''}${inCandidate ? ' stv__char--cand' : ''}`}>
              <b>{ch}</b><small>{i}</small>
            </span>
          )
        })}
        {text.length === 0 && <span className="stv__empty">empty text</span>}
      </div>
      <div className="stv__lanes" aria-label="Found spans by word">
        {lanes.map(({ word, index }) => (
          <div key={word + index} className="stv__lane">
            <span className="stv__word">{word}</span>
            <div className="stv__track">
              {step.pairs.filter(p => p[1] - p[0] + 1 === word.length && text.startsWith(word, p[0])).map(p => (
                <div key={`${p[0]}-${p[1]}`} className={`stv__span ${LANE_COLORS[laneOf(word)]}`}
                  style={{ left: `${(p[0] / text.length) * 100}%`, width: `${((p[1] - p[0] + 1) / text.length) * 100}%` }}>
                  [{p[0]},{p[1]}]
                </div>
              ))}
              {cand && step.word === word && (
                <div className="stv__cand" style={{ left: `${(cand[0] / text.length) * 100}%`, width: `${((cand[1] - cand[0] + 1) / text.length) * 100}%` }} />
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="stv__status" role="status">
        {step.message}
      </p>
      <p className="stv__list">
        Pairs so far: {step.pairs.length ? step.pairs.map(p => `[${p[0]}, ${p[1]}]`).join(' ') : 'none yet'}
      </p>
    </figure>
  )
}
