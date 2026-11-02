const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

// Problem-specific visual for 3838: letter weights, the running sum, modulo 26,
// the reverse alphabet mapping and the output built so far.
export default function WeightedMappingVisual({ run, step }) {
  const { words, weights } = run.input
  const word = step.word >= 0 ? words[step.word] : ''
  const activeLetter = step.letter >= 0 ? word[step.letter] : null
  const prefixWeights = step.letter >= 0 ? [...word.slice(0, step.letter + 1)].map(ch => weights[ch.charCodeAt(0) - 97]) : []
  const value = step.value
  const mappedIndex = value === undefined ? -1 : value
  const outputLetters = [...(step.output ?? '')]
  const pendingCount = Math.max(0, words.length - outputLetters.length)

  return <div className="weighted-mapping-visual">
    <section aria-label="Letter weight lookup">
      <h3>Letter weights</h3>
      <ol className="weighted-mapping-visual__lookup" style={{ display: 'grid', gridTemplateColumns: 'repeat(13, minmax(0, 1fr))', gap: 4, listStyle: 'none', padding: 0 }}>
        {[...ALPHABET].map((ch, i) => {
          const active = ch === activeLetter
          return <li key={ch} aria-current={active ? 'step' : undefined}
            style={{ border: active ? '2px solid currentColor' : '1px solid currentColor', borderRadius: 6, padding: '2px 0', textAlign: 'center', fontWeight: active ? 700 : 400 }}>
            <span>{ch}</span><br /><span>{weights[i]}</span>{active ? <span> (active)</span> : null}
          </li>
        })}
      </ol>
    </section>

    <section aria-label="Current word">
      <p>{step.word >= 0 ? `Word ${step.word + 1}: ` : 'All words processed. '}
        {[...word].map((ch, i) => <span key={i} style={{ fontWeight: i === step.letter ? 700 : 400, textDecoration: i === step.letter ? 'underline' : 'none', marginRight: 2 }}>{ch}</span>)}
      </p>
      {step.phase === 'sum' ? <p>{`total = ${prefixWeights.join(' + ')} = ${step.total}`}</p> : null}
      {step.phase === 'word' ? <p>{`total = 0 before adding ${word}`}</p> : null}
      {step.phase === 'mod' || step.phase === 'emit' ? <p>{`total ${step.total} mod 26 = ${value}`}</p> : null}
      {step.phase === 'done' ? <p>{`Last total ${step.total}, mod 26 = ${value}`}</p> : null}
    </section>

    <section aria-label="Reverse alphabet mapping">
      <h3>Reverse alphabet (value to letter)</h3>
      <p style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {[...Array(26)].map((_, v) => {
          const letter = String.fromCharCode(122 - v)
          const active = v === mappedIndex
          return <span key={v} aria-current={active ? 'step' : undefined} style={{ fontWeight: active ? 700 : 400, textDecoration: active ? 'underline' : 'none' }}>{`${v}→${letter}`}</span>
        })}
      </p>
      {mappedIndex >= 0 ? <p>{`${mappedIndex} maps to ${String.fromCharCode(122 - mappedIndex)} (122 minus ${mappedIndex} = ${122 - mappedIndex})`}</p> : null}
    </section>

    <section aria-label="Output so far">
      <h3>Output</h3>
      <p>
        {outputLetters.map((ch, i) => <span key={`o${i}`} style={{ border: '1px solid currentColor', borderRadius: 4, padding: '2px 6px', marginRight: 4 }}>{ch}</span>)}
        {step.phase !== 'done' ? [...Array(pendingCount)].map((_, i) => <span key={`p${i}`} style={{ border: '1px dashed currentColor', borderRadius: 4, padding: '2px 6px', marginRight: 4, opacity: 0.6 }}>?</span>) : null}
      </p>
      <p aria-label="Result">{`result = "${step.output ?? ''}"`}</p>
    </section>
  </div>
}
