import IndexedSequence from '../../components/shared/IndexedSequence'

// The string split into two halves; vowels are marked on each side and the running counts shown.
const VOWELS = 'aeiouAEIOU'

export default function View({ run, step }) {
  const s = run.input
  const half = s.length / 2
  const isVowel = i => VOWELS.includes(s[i])
  return <div className="halves-view">
    <IndexedSequence label="Left half" length={half} active={step.index >= 0 && step.index < half ? step.index : -1}
      valueAt={i => s[i]} roleAt={i => (isVowel(i) ? 'vowel' : '')} />
    <IndexedSequence label="Right half" length={half} active={step.index >= half ? step.index - half : -1}
      valueAt={i => s[half + i]} roleAt={i => (isVowel(half + i) ? 'vowel' : '')} />
    <dl>
      <dt>Left vowels</dt><dd>{step.snapshot.a}</dd>
      <dt>Right vowels</dt><dd>{step.snapshot.b}</dd>
    </dl>
    <p>{step.message}</p>
  </div>
}
