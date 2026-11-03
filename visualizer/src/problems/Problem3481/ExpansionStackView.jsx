import './ExpansionStackView.css'

// Left: the chain of keys being expanded (the recursion stack). Middle: memoised expansions. Bottom: the top-level output built so far.
export default function ExpansionStackView({ run, step }) {
  if (!run || !step) return <section className="exp-view"><p className="exp-empty">Press Play to expand the references.</p></section>
  const { text, replacements } = run.input
  const { stack, memo, output, phase, token } = step
  const valueOf = key => (replacements.find(([k]) => k === key) || [, ''])[1]
  return (
    <section className="exp-view" aria-label="Recursive expansion of substitutions">
      <div className="exp-block">
        <h3>Text</h3>
        <code className="exp-text">{text}</code>
      </div>
      <div className="exp-block">
        <h3>Expansion stack</h3>
        <ol className="exp-stack" aria-label="Keys being expanded">
          <li className="exp-frame exp-frame--root">text</li>
          {stack.map((key, i) => (
            <li key={`${key}${i}`} className={`exp-frame${i === stack.length - 1 && phase === 'enter' ? ' exp-frame--new' : ''}`}>
              %{key}% = <code>{valueOf(key)}</code>
            </li>
          ))}
        </ol>
        {stack.length === 0 && <p className="exp-note">The stack is empty: the top-level text is being read.</p>}
      </div>
      <div className="exp-block">
        <h3>Memo</h3>
        {memo.length === 0 ? <p className="exp-note">Nothing memoised yet.</p> : (
          <table className="exp-memo">
            <thead><tr><th>key</th><th>expansion</th></tr></thead>
            <tbody>
              {memo.map(([key, value]) => (
                <tr key={key} className={phase === 'hit' && token === key ? 'exp-memo--hit' : phase === 'store' && token === key ? 'exp-memo--new' : ''}>
                  <td>%{key}%</td><td><code>{value}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="exp-block">
        <h3>Output so far</h3>
        <output className="exp-output" aria-label="Top-level output">{output || '(empty)'}</output>
      </div>
      <p className="exp-summary">{step.message}</p>
    </section>
  )
}
