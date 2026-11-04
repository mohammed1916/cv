import "./GoodGroupView.css";

function countsOf(key) {
  const counts = Array(10).fill(0)
  for (const ch of key) counts[Number(ch)] += 1
  return counts
}

function factorial(m) { let out = 1; for (let i = 2; i <= m; i += 1) out *= i; return out }

export default function GoodGroupView({ run, step }) {
  const n = run.input.n
  const divisible = step.candidates.filter(c => c.divisible)
  const groups = new Map()
  for (const c of divisible) {
    const key = c.text.split("").sort().join("")
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(c.text)
  }
  const activeKey = step.key ?? null
  const counts = activeKey ? countsOf(activeKey) : null
  const formula = counts
    ? `${factorial(n)} / (${counts.filter(c => c > 0).map(c => `${c}!`).join(" * ")})`
    : null
  return (
    <div className="gg-view">
      <p className="gg-muted">Chips are palindromes built so far. Filled chips are divisible by k. Palindromes with the same digits form one group.</p>
      <div className="gg-chips">
        {step.candidates.map((c, i) => (
          <span key={c.text + i} className={`gg-chip ${c.divisible ? "is-divisible" : ""} ${i === step.index ? "is-current" : ""}`}>{c.text}</span>
        ))}
      </div>
      <div className="gg-chips">
        {[...groups].map(([key, members]) => (
          <div key={key} className={`gg-group ${key === activeKey ? "is-active" : ""}`}>
            <strong>digits {key}</strong>
            <span>{members.join(", ")}</span>
          </div>
        ))}
      </div>
      {formula && <p className="gg-formula">arrangements of {activeKey}: {formula} = {step.arrangements}</p>}
      <p className="gg-muted">Total good integers so far: {step.total}</p>
    </div>
  )
}
