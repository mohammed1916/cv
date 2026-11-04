import "./PairGridView.css";
export default function PairGridView({ run, step }) {
  const texts = run.input.nums.map((_, index) => step.texts[index])
  const n = texts.length
  const counted = new Set(step.pairs.map(([a, b]) => `${a}-${b}`))
  const reach = step.reach ?? []
  return (
    <div className="ac-view">
      <p className="ac-note">Each row j is compared with every earlier index i. A pair counts when texts[i] is in the reach of texts[j].</p>
      <div className="ac-grid" style={{ gridTemplateColumns: `auto repeat(${n}, minmax(34px, 1fr))` }}>
        <span />
        {texts.map((text, i) => <span key={`h${i}`} className="ac-head">{text}</span>)}
        {texts.map((rowText, j) => (
          <FragmentRow key={`r${j}`} j={j} rowText={rowText} texts={texts} step={step} counted={counted} />
        ))}
      </div>
      <div className="ac-reach">
        <strong>Reach of {step.j >= 0 ? texts[step.j] : "-"}</strong>
        <span>{reach.length ? reach.join(", ") : "computed in the Reach step"}</span>
      </div>
      <p className="ac-count">Almost equal pairs so far: {step.count}</p>
    </div>
  )
}

function FragmentRow({ j, rowText, texts, step, counted }) {
  return (
    <>
      <span className="ac-head">{rowText}</span>
      {texts.map((_, i) => {
        const isPair = i < j
        const key = `${i}-${j}`
        const role = !isPair ? "blank" : counted.has(key) ? "paired" : step.j === j && step.i === i ? "candidate" : "idle"
        return <span key={key} className={`ac-cell ac-${role}`}>{isPair ? (role === "paired" ? "✓" : role === "candidate" ? "?" : "·") : ""}</span>
      })}
    </>
  )
}
