import './BudgetTableView.css'

// Rows are budgets 0..B holding the best profit so far. The cell being updated is highlighted,
// and the budget it draws from (b - cost) is blue.
export default function BudgetTableView({ run, step }) {
  const { present, future, budget } = run.input
  const active = step.stock >= 0
  return (
    <div className="budget-view">
      <table className="budget-table" aria-label="Best profit per budget">
        <thead><tr><th>budget</th><th>best profit</th></tr></thead>
        <tbody>
          {Array.from({ length: budget + 1 }, (_, b) => (
            <tr key={b}>
              <th>{b}</th>
              <td className={active && step.b === b ? 'is-cell' : active && step.from === b ? 'is-from' : ''}>{step.dp[b]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="budget-caption">{active ? `Stock ${step.stock}: buy ${present[step.stock]}, sell ${future[step.stock]} (profit ${future[step.stock] - present[step.stock]}).` : 'Table of best profits before any stock is considered.'}</p>
      {active && step.b >= 0 && <p className="budget-detail">Skip: {step.skip} · buy from budget {step.from}: {step.buy} · keep {step.dp[step.b]} at budget {step.b}.</p>}
    </div>
  )
}
