import './HammingPairView.css'

// Each number as an m-bit row. The current pair is compared bit by bit; differing bits are marked.
export default function HammingPairView({ run, step }) {
  const { nums, m } = run.input
  const bits = value => Array.from({ length: m }, (_, k) => (value >> (m - 1 - k)) & 1)
  const diffBits = bits(step.diff ?? 0)
  const hasPair = step.i >= 0 && step.j >= 0
  const diffs = hasPair ? diffBits : null
  return (
    <section className="hamming-view" aria-label="Hamming distance pairs">
      <div className="hamming-view__grid" role="table" aria-label="Numbers as bits">
        {nums.map((value, index) => {
          const role = index === step.i ? 'A' : index === step.j ? 'B' : ''
          return (
            <div key={index} className={`hamming-view__row${role ? ' is-active' : ''}`} role="row">
              <span className="hamming-view__tag" role="cell">{role || ' '}</span>
              <span className="hamming-view__value" role="cell">{value}</span>
              <span className="hamming-view__bits" role="cell">
                {bits(value).map((bit, k) => (
                  <span key={k} className={`hamming-view__bit${bit ? ' is-one' : ''}${hasPair && diffs[k] ? ' is-diff' : ''}`}>{bit}</span>
                ))}
              </span>
              <span className="hamming-view__answer" role="cell">{step.answer[index] ? `best ${step.answer[index]}` : ''}</span>
            </div>
          )
        })}
      </div>
      <p className="hamming-view__summary">
        {hasPair
          ? `A = ${nums[step.i]}, B = ${nums[step.j]}: XOR has ${step.count} set bit${step.count === 1 ? '' : 's'}; best for A is ${step.best}.`
          : step.phase === 'done' ? `Answers: [${step.answer.join(', ')}].` : 'Pick a number as A and compare it with every number as B.'}
      </p>
    </section>
  )
}
