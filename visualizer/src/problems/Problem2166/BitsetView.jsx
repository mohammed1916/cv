import OperationLog from '../../components/shared/OperationLog'

// Each cell is a logical bit. The stored value underneath is shown so the flip flag is visible.
export default function BitsetView({ run, step }) {
  const ops = run.frames.filter(frame => frame.phase === 'op').map(frame => ({
    name: frame.op === 'toString' ? 'toString' : frame.op,
    args: frame.touched >= 0 ? [frame.touched] : [],
    returned: frame.op === 'fix' || frame.op === 'unfix' || frame.op === 'flip' ? undefined : frame.returned,
  }))
  const current = step.opIndex ?? -1
  return (
    <div className="bitset-view">
      <p>Flip flag: <strong>{step.flip ? 'on, every bit is read inverted' : 'off'}</strong> · logical ones: <strong>{step.ones}</strong> of {step.size}</p>
      <div className="bitset-row" role="img" aria-label={`Logical bits ${step.bits.join('')}`}>
        {step.bits.map((bit, i) => <div key={i} className={`bitset-cell${i === step.touched ? ' is-touched' : ''}`}>
          <small>[{i}]</small>
          <strong>{bit}</strong>
          <span className="bitset-raw">stored {step.raw[i]}</span>
        </div>)}
      </div>
      <OperationLog title="Calls and returned values" ops={ops} current={current} through={current < 0 ? -1 : current} />
    </div>
  )
}
