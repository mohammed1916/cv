// Two expression trees side by side, with the leaf letters in visiting order and a running tally.
export default function View({ run, step }) {
  const { root1, root2 } = run.input
  const trees = [{ name: 'Tree 1', tree: root1, id: 1 }, { name: 'Tree 2', tree: root2, id: 2 }]
  const letters = [...new Set([...root1, ...root2].filter(v => v && v !== '+'))].sort()
  const tally = step.snapshot.counts ?? {}
  return <div className="expression-view">
    {trees.map(({ name, tree, id }) => <section key={id} aria-label={name} className={step.tree === id ? 'is-active' : ''}>
      <h3>{name}</h3>
      <div className="expression-view__nodes">{tree.map((value, p) => value === null
        ? <span key={p} className="expression-view__gap">·</span>
        : <span key={p} className={`expression-view__node ${step.tree === id && step.position === p ? 'is-scan' : ''} ${value === '+' ? 'is-op' : 'is-leaf'}`}>{value}</span>)}
      </div>
    </section>)}
    <table aria-label="Letter tally">
      <caption>Net count per letter (tree 1 minus tree 2)</caption>
      <thead><tr><th>Letter</th><th>Net</th></tr></thead>
      <tbody>{letters.map(letter => <tr key={letter}><th>{letter}</th><td>{tally[letter] ?? 0}</td></tr>)}</tbody>
    </table>
    <p>{step.phase === 'done' ? `Equivalent: ${String(run.result)}` : step.message}</p>
  </div>
}
