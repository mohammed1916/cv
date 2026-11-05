// The string being scanned, the stack (bottom to top) and the pairs removed so far.
export default function View({ run, step }) {
  const { s } = run.input
  const stack = step.stack ?? []
  return <div className="pair-removal-view">
    <p aria-label="Input string">Input: <code>{s}</code></p>
    <ol aria-label="Stack, bottom to top" className="pair-removal-view__stack">
      {stack.length === 0 ? <li>empty</li> : stack.map((c, i) => <li key={i}>{c}</li>)}
    </ol>
    <dl>
      <dt>Pairs removed so far</dt><dd>{step.snapshot.taken}</dd>
    </dl>
    <p>{step.message}</p>
  </div>
}
