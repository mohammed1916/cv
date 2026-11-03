import './LengthLadderView.css'

export default function LengthLadderView({ run, step }) {
  const { min_length, max_length, zero_group, one_group } = run.input
  return (
    <div className="ll-view">
      <p className="ll-rule">
        Blocks: “{'0'.repeat(zero_group)}” (zero_group = {zero_group}) and “{'1'.repeat(one_group)}” (one_group = {one_group}).
        Lengths {min_length} to {max_length} are counted.
      </p>
      <div className="ll-ladder" role="list" aria-label="Ways to build each length">
        {step.ways.map((value, length) => {
          const counted = length >= min_length && length <= max_length
          const current = length === step.i
          const fromZero = step.fromZero !== null && current
          const fromOne = step.fromOne !== null && current
          const summed = length === step.summed
          const role = current ? 'now' : summed ? 'summed' : counted ? 'counted' : 'outside'
          return (
            <div key={length} role="listitem" className={`ll-rung ll-rung--${role}`} data-role={role}>
              <span className="ll-rung__len">len {length}</span>
              <span className="ll-rung__ways">{value}</span>
              {fromZero && <span className="ll-tag ll-tag--zero">+{step.fromZero} from {length - zero_group} via 0-block</span>}
              {fromOne && <span className="ll-tag ll-tag--one">+{step.fromOne} from {length - one_group} via 1-block</span>}
            </div>
          )
        })}
      </div>
      <output className="ll-answer" aria-label="Running answer">Total for counted lengths: {step.answer ?? '...'}</output>
    </div>
  )
}
