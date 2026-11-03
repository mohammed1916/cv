import './ChoiceColumnsView.css'

// One column per word. Each column lists the word's group; the option chosen on this path is lit.
export default function ChoiceColumnsView({ run, step }) {
  const words = run.input.text.split(' ')
  const columns = step.options.length ? step.options : words.map(word => [word])
  return <div className="choice-view">
    <section className="choice-view__groups" aria-label="Synonym groups">
      <span className="choice-view__label">groups</span>
      {step.groups.length === 0 && <span className="choice-view__empty">no synonym pairs yet</span>}
      {step.groups.map(group => <span key={group.join(',')} className="choice-view__group">{`{${group.join(', ')}}`}</span>)}
    </section>
    <div className="choice-view__columns">
      {columns.map((options, position) => <figure key={position} className={`choice-view__column${position === step.depth ? ' is-deciding' : ''}`}>
        <figcaption>{words[position]}</figcaption>
        <ol>
          {options.map(option => {
            const picked = step.chosen[position] === option
            return <li key={option} className={picked ? 'is-picked' : ''}>{option}</li>
          })}
        </ol>
      </figure>)}
    </div>
    <section className="choice-view__sentences" aria-label="Sentences built">
      <span className="choice-view__label">sentences</span>
      {step.emitted.length === 0 && <span className="choice-view__empty">none yet</span>}
      <ul>{step.emitted.map(sentence => <li key={sentence}>{sentence}</li>)}</ul>
    </section>
    <output aria-label="Choice readout">
      {step.depth >= 0 ? `position ${step.depth} · ${step.chosen.length} chosen` : 'reading the synonyms'}
    </output>
  </div>
}
