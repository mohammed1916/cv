import IndexedSequence from '../../components/shared/IndexedSequence'

const show = c => (c === ' ' ? '␣' : c)

export default function View({ run, step }) {
  const chars = [...run.input]
  const out = [...(step.snapshot.out ?? run.result)]
  const placed = step.snapshot.placed ?? (step.phase === 'done' ? run.words.length : 0)
  return <div className="rearrange-view">
    <IndexedSequence label="Input text" length={chars.length} active={step.index}
      valueAt={i => show(chars[i])} roleAt={i => (chars[i] === ' ' ? 'space' : 'letter')} />
    <dl className="rearrange-view__stats">
      <dt>Words</dt><dd>{run.words.length}</dd>
      <dt>Spaces</dt><dd>{run.spaces}</dd>
      <dt>Gap size</dt><dd>{step.phase === 'scan' ? '?' : run.words.length === 1 ? 'none' : run.gap}</dd>
      <dt>Leftover at end</dt><dd>{step.phase === 'scan' ? '?' : run.words.length === 1 ? run.spaces : run.extra}</dd>
      <dt>Words placed</dt><dd>{placed}</dd>
    </dl>
    <IndexedSequence label="Output so far" length={out.length} active={out.length - 1}
      valueAt={i => show(out[i])} roleAt={i => (out[i] === ' ' ? 'gap' : 'letter')} />
  </div>
}
