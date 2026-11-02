import './PointerLedgerView.css'

// Ledger: one row per original node, with its pointers and the copy it maps to. The current node is highlighted.
export default function PointerLedgerView({ run, step }) {
  const { val, left, right, random } = run.input
  const copyNumber = new Map(step.created.map((orig, k) => [orig, k]))
  const show = p => (p === -1 ? 'null' : String(p))
  return (
    <figure className="pl-view">
      <table>
        <thead>
          <tr><th>Original</th><th>value</th><th>left</th><th>right</th><th>random</th><th>Copy</th></tr>
        </thead>
        <tbody>
          {val.map((v, i) => {
            const cls = i === step.node ? 'pl-row pl-row--now' : copyNumber.has(i) ? 'pl-row pl-row--copied' : 'pl-row'
            return (
              <tr key={i} className={cls}>
                <th scope="row">node {i}</th>
                <td>{v}</td>
                <td>{show(left[i])}</td>
                <td>{show(right[i])}</td>
                <td>{show(random[i])}</td>
                <td>{copyNumber.has(i) ? `→ copy ${copyNumber.get(i)}` : 'not yet'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <figcaption>
        {step.created.length} of {val.length} copied. {step.message}
      </figcaption>
    </figure>
  )
}
