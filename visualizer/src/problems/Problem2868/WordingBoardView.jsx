import './WordingBoardView.css'

// Two word lists face each other. The last word played sits in the centre; legal candidates for the mover are outlined.
export default function WordingBoardView({ run, step }) {
  const { alice, bob } = run.input
  const candidates = new Set(step.candidates || [])
  const chip = (word, owner) => {
    const classes = ['wording-board__word']
    if (step.mover === owner && candidates.has(word)) classes.push('is-legal')
    if (step.word === word && step.mover === owner) classes.push('is-tried')
    if (step.played?.includes(word)) classes.push('is-played')
    return <span key={`${owner}-${word}`} className={classes.join(' ')} aria-label={`${owner} word ${word}`}>{word}</span>
  }
  return <div className="wording-board">
    <div className="wording-board__side" aria-label="Alice's words">
      <h4>Alice</h4>
      <div className="wording-board__list">{alice.map(w => chip(w, 'alice'))}</div>
    </div>
    <div className="wording-board__centre">
      <span className="wording-board__label">Last word</span>
      <strong aria-label="Last word">{step.last ?? '-'}</strong>
      <span className="wording-board__turn">{step.mover ? `${step.mover === 'alice' ? 'Alice' : 'Bob'} to move` : 'Game over'}</span>
      {step.value !== null && step.value !== undefined && step.phase !== 'done' && <span className="wording-board__verdict">{step.value ? 'Mover wins this word' : 'Reply wins'}</span>}
      {step.phase === 'done' && <span className="wording-board__verdict">{step.value ? 'Alice wins' : 'Bob wins'}</span>}
      <ol className="wording-board__chain" aria-label="Words played in order">
        {(step.played || []).map((w, i) => <li key={`${w}-${i}`}>{w}</li>)}
      </ol>
    </div>
    <div className="wording-board__side" aria-label="Bob's words">
      <h4>Bob</h4>
      <div className="wording-board__list">{bob.map(w => chip(w, 'bob'))}</div>
    </div>
    <p className="wording-board__legend">Outlined words are legal for the mover: larger than the last word, and starting with the same or the next letter. Struck-through words are the ones already played.</p>
    <output>{step.message}</output>
  </div>
}
