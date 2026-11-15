import IndexedSequence from '../../components/shared/IndexedSequence'
import { useTutorialScene } from '../../components/shared/TutorialScene'
import StackOperationView from '../../components/shared/StackOperationView'
import './NextGreaterVisual.css'

// Focused view: the waiting stack (bottom to top) drawn as an open cup, plus the values just popped.
// Full view keeps the complete list, answers and stack for the non-tutorial workspace.
export default function NextGreaterVisual({ run, step }) {
  const scene = useTutorialScene()
  const values = run.input.values
  if (!scene) {
    return <>
      <IndexedSequence label="List values (i = current position)" length={values.length} valueAt={i => values[i]} active={step.index}
        roleAt={i => (step.stack.includes(i) ? 'waiting' : step.answer[i] ? 'answered' : '')} />
      <IndexedSequence label="Answers so far" length={step.answer.length} valueAt={i => step.answer[i]} />
      <output aria-label="Monotonic stack">{`Stack of waiting positions, bottom to top: ${step.stack.length ? step.stack.map(i => `${i} (value ${values[i]})`).join(', ') : 'empty'}`}</output>
      <p>{step.message}</p>
    </>
  }
  const { focus } = scene
  if (focus.kind === 'start' || focus.kind === 'result') {
    return <section className="ngv" aria-label="Next greater answers">
      <ol className="ngv__answers">
        {step.answer.map((a, i) => <li key={i} data-position={i} className={focus.kind === 'result' && a ? 'is-answered' : ''}>
          <small>[{i}]</small> <strong>{a}</strong>
        </li>)}
      </ol>
    </section>
  }
  const resolving = focus.popped !== null
  return <section className="ngv" aria-label="Next greater focus">
    <div className="ngv__cell" aria-label="Value being scanned">
      <small>position {focus.index}</small>
      <strong>{focus.value}</strong>
    </div>
    {resolving && <div className={`ngv__cell ${focus.kind === 'assign' ? 'is-answered' : 'is-popped'}`} aria-label="Position being resolved">
      <small>position {focus.popped}</small>
      <strong>{values[focus.popped]}</strong>
      {focus.kind === 'assign' && <span>next greater: {focus.value}</span>}
    </div>}
    {focus.kind === 'check' && <p className="ngv__compare">{focus.top === null ? 'Stack empty: nothing to compare.' : `Top ${focus.top} (value ${focus.topValue}) ${focus.compare ? 'is smaller than' : 'is not smaller than'} ${focus.value}.`}</p>}
    <StackOperationView
      label="Waiting stack"
      items={focus.stack.map(i => `[${i}] ${values[i]}`)}
      popped={focus.kind === 'check' && focus.top !== null ? [{ name: 'top', value: focus.topValue }] : resolving ? [{ name: `position ${focus.popped}`, value: values[focus.popped] }] : []}
    />
  </section>
}
