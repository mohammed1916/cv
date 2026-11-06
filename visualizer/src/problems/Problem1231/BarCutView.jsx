import './BarCutView.css'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'

const BAR_W = 34
const GAP = 8
const BASE = 150
const TOP = 26

export default function BarCutView({ run, step }) {
  const values = run.input.sweetness
  const k = run.input.k
  const max = Math.max(1, ...values)
  const scaleH = value => (value / max) * (BASE - TOP)
  const width = values.length * (BAR_W + GAP) + 20
  const total = run.input.sweetness.reduce((sum, value) => sum + value, 0)
  const cutAfter = new Set(step.cuts)
  const x = index => 10 + index * (BAR_W + GAP)
  const axisX = value => 10 + (value / Math.max(1, total)) * (width - 20)
  return <div className="cut-view">
    <AnswerRangeBar title="Answer search over the minimum piece sum" min={0} max={total} low={step.lo} high={step.hi}
      probe={step.feasible == null ? null : (step.mid ?? null)} verdict={step.feasible === true} />
    <svg viewBox={`0 0 ${width} ${BASE + 36}`} role="img" aria-label={`Sweetness bars with ${step.cuts.length} cut${step.cuts.length === 1 ? '' : 's'} for the candidate ${step.mid ?? 'none'}`}>
      {values.map((value, index) => {
        const h = scaleH(value)
        const classes = ['cut-view__bar']
        if (index <= step.scanTo) classes.push('is-scanned')
        if (index === step.scanTo) classes.push('is-current')
        return <g key={index}>
          <rect className={classes.join(' ')} x={x(index)} y={BASE - h} width={BAR_W} height={h} rx={3} />
          <text x={x(index) + BAR_W / 2} y={BASE - h - 4} textAnchor="middle" className="cut-view__value">{value}</text>
          <text x={x(index) + BAR_W / 2} y={BASE + 14} textAnchor="middle" className="cut-view__index">{index}</text>
          {cutAfter.has(index) && <line className="cut-view__cut" x1={x(index) + BAR_W + GAP / 2} x2={x(index) + BAR_W + GAP / 2} y1={6} y2={BASE + 4} />}
        </g>
      })}
    </svg>
    <svg viewBox={`0 0 ${width} 56`} role="img" aria-label={`Answer range from ${step.lo} to ${step.hi}`} className="cut-view__range">
      <line x1={10} x2={width - 10} y1={28} y2={28} className="cut-view__axis" />
      <rect x={axisX(step.lo)} y={20} width={Math.max(2, axisX(step.hi) - axisX(step.lo))} height={16} className="cut-view__bracket" />
      {step.mid !== null && step.mid !== undefined && <line x1={axisX(step.mid)} x2={axisX(step.mid)} y1={10} y2={46} className={`cut-view__mid ${step.feasible === false ? 'is-reject' : step.feasible ? 'is-accept' : ''}`} />}
      <text x={axisX(step.lo)} y={52} className="cut-view__value">lo {step.lo}</text>
      <text x={axisX(step.hi)} y={52} textAnchor="end" className="cut-view__value">hi {step.hi}</text>
    </svg>
    <output aria-label="Cut readout">{`need ${k + 1} pieces · ${step.cuts.length} closed${step.answer !== null ? ` · answer ${step.answer}` : ''}`}</output>
  </div>
}
