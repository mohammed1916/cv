import './DigitWordScanView.css'

// Characters as tiles with a cursor. A matched digit word is outlined as one span and the scan jumps past it;
// unmatched characters are skipped one at a time. The digits found so far are printed below.
export default function DigitWordScanView({ run, step }) {
  if (!run || !step) return <section className="dw-view"><p className="dw-empty">Press Play to scan the string for digit words.</p></section>
  const s = run.input
  const [from, to] = step.span || [-1, -1]
  return (
    <section className="dw-view" aria-label="Digit word scan">
      <div className="dw-tiles">
        {[...s].map((ch, index) => {
          const classes = ['dw-tile']
          if (index === step.at) classes.push('dw-tile--cursor')
          if (index >= from && index <= to) classes.push('dw-tile--match')
          return (
            <div key={index} className={classes.join(' ')}>
              <span className="dw-letter">{ch}</span>
              <span className="dw-index">{index}</span>
            </div>
          )
        })}
        <div className={`dw-tile dw-tile--end ${step.at >= s.length ? 'dw-tile--cursor' : ''}`}>
          <span className="dw-letter">end</span>
        </div>
      </div>
      <div className="dw-readout">
        <span>{step.word ? `"${step.word}" reads as ${DIGITS[step.word]}` : (step.phase === 'done' ? 'scan finished' : `no digit word starts at ${step.at}`)}</span>
        <span className="dw-digits" aria-label="Digits so far">{`digits: ${step.digits || '(none yet)'}`}</span>
      </div>
      <p className="dw-key">Outlined: a digit word consumed in one jump. Gold: cursor. Letters inside a consumed word are never restarted.</p>
    </section>
  )
}

const DIGITS = { zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9' }
