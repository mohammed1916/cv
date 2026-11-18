import './MissingLineView.css'
import PointerRail from '../../components/shared/PointerRail'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'

function pointerTags(step) {
  const tags = []
  if (step.lo < step.hi) tags.push({ id: 'lo', index: step.lo, label: 'lo', tone: 'primary' })
  if (step.mid >= 0) tags.push({ id: 'mid', index: step.mid, label: 'mid', tone: 'accent' })
  tags.push({ id: 'hi', index: step.hi, label: 'hi', tone: 'muted' })
  return tags
}

export default function MissingLineView({ run, step }) {
  const { nums, k } = run.input
  const present = new Set(nums)
  const answer = step.phase === 'done' ? step.result : null
  const last = Math.max(nums[nums.length - 1], answer ?? 0)
  const values = []
  for (let v = nums[0]; v <= last; v++) values.push(v)
  let counter = 0
  const counted = new Map()
  for (const v of values) if (!present.has(v) && v > nums[0]) { counter += 1; counted.set(v, counter) }
  const pointers = pointerTags(step).filter(p => p.index < nums.length)
  const probed = new Set(step.probes.map(p => nums[p.index]))
  const midValue = step.mid >= 0 ? nums[step.mid] : null
  return (
    <figure className="mlv" aria-label="Values on a number line, with missing values counted upward from the first element">
      <PointerRail
        title="Indices in nums"
        values={nums}
        range={{ start: step.lo, end: step.hi - 1 }}
        pointers={pointers}
        highlight={step.mid >= 0 ? [step.mid] : []}
        note={`missing above nums[0]: ${nums.map((v, i) => v - nums[0] - i).join(', ')}`}
      />
      <AnswerRangeBar title="Index search" min={0} max={nums.length} low={step.lo} high={step.hi} probe={step.mid >= 0 ? step.mid : null} verdict={step.mid >= 0 ? step.probes.at(-1).missing >= k : null} />
      <div className="mlv__line" role="list" aria-label="Number line">
        {values.map(v => {
          const isPresent = present.has(v)
          const count = counted.get(v)
          const isAnswer = answer !== null && v === answer
          const cls = [
            'mlv__cell',
            isPresent ? 'mlv__cell--present' : 'mlv__cell--missing',
            v === midValue ? 'mlv__cell--probe' : '',
            probed.has(v) ? 'mlv__cell--seen' : '',
            count !== undefined && count <= k ? 'mlv__cell--small' : '',
            isAnswer ? 'mlv__cell--answer' : '',
          ].join(' ')
          return (
            <span role="listitem" key={v} className={cls} title={isPresent ? `${v} is in nums` : `${v} missing${count ? `, #${count}` : ''}`}>
              {isPresent ? '●' : count ? count : '○'}
            </span>
          )
        })}
      </div>
      <p className="mlv__status" role="status">
        {step.mid >= 0
          ? `Probe ${step.mid}: ${step.probes.at(-1).missing} missing so far, target k = ${k}.`
          : answer !== null ? `The ${k}th missing number is ${answer}.` : `Looking for the ${k}th missing number.`}
      </p>
      <p>{`Search range lo = ${step.lo}, hi = ${step.hi}${step.mid >= 0 ? `, middle tested mid = ${step.mid}` : ''}.`}</p>
      <p className="mlv__legend">● present in nums · numbered hollow cells are missing, counted upward from {nums[0]} · amber = answer</p>
    </figure>
  )
}
