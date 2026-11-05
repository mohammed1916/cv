import './PrefixLookupView.css'

// Prefix-sum table with the four cells read for the tested square outlined: sum = D - B - C + A.
export default function PrefixLookupView({ prefix, cell, side }) {
  const rows = prefix.length
  const cols = prefix[0].length
  let corners = null
  if (cell && side) {
    const r2 = cell[0] + 1
    const c2 = cell[1] + 1
    const r1 = cell[0] - side + 1
    const c1 = cell[1] - side + 1
    corners = { D: [r2, c2], B: [r1, c2], C: [r2, c1], A: [r1, c1] }
  }
  const labelOf = (r, c) => {
    if (!corners) return null
    for (const [name, [rr, cc]] of Object.entries(corners)) if (rr === r && cc === c) return name
    return null
  }
  return (
    <figure className="pl-view">
      <table aria-label="Prefix sums">
        <caption>Prefix sums: a square sum is D − B − C + A</caption>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => {
                const name = labelOf(r, c)
                return <td key={c} className={name ? 'pl-cell pl-cell--read' : 'pl-cell'}>
                  {prefix[r][c]}{name && <sup>{name}</sup>}
                </td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
