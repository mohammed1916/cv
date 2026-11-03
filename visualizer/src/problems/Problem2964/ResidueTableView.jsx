import './ResidueTableView.css'

export default function ResidueTableView({ run, step }) {
  const { nums, d } = run.input
  const residues = Array.from({ length: d }, (_, r) => r)
  const sizes = [1, 2, 3]
  return (
    <div className="residue-table-view">
      <p className="residue-rule">Each row counts chosen subsequences of one size, grouped by their sum's remainder mod {d}. The answer is the size-3 cell for remainder 0.</p>
      <ol className="residue-strip" aria-label="Numbers">
        {nums.map((x, i) => (
          <li key={i} className={`residue-cell${i === step.index ? ' is-current' : i < step.index ? ' is-seen' : ''}`}>
            <span className="residue-index">{i}</span>
            <strong>{x}</strong>
          </li>
        ))}
      </ol>
      <table className="residue-table">
        <caption>Subsequences by size and remainder</caption>
        <thead>
          <tr>
            <th scope="col">size</th>
            {residues.map(r => <th key={r} scope="col">mod {r}</th>)}
          </tr>
        </thead>
        <tbody>
          {sizes.map(t => (
            <tr key={t}>
              <th scope="row">{t}</th>
              {residues.map(r => {
                const value = step.ways[t][r]
                const isAnswer = t === 3 && r === 0
                return <td key={r} className={`${isAnswer ? 'is-answer ' : ''}${value > 0 ? 'is-filled' : ''}`}>{value}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <output className="residue-message" aria-label="Element status">{step.message}</output>
      <p className="residue-answer">Triples so far: {step.ways[3][0]}</p>
    </div>
  )
}
