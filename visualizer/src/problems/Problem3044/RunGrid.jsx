import MatrixGrid from '../../components/shared/MatrixGrid'

// The digit grid with the current straight run highlighted, and the primes counted so far.
export default function RunGrid({ matrix, step }) {
  const highlighted = []
  if (step.cell && step.dir && step.num !== null) {
    const length = String(step.num).length
    for (let k = 0; k < length; k++) {
      highlighted.push({ row: step.cell[0] + step.dir[0] * k, col: step.cell[1] + step.dir[1] * k })
    }
  }
  return <div style={{ margin: '8px 0' }}>
    <MatrixGrid matrix={matrix} label="Digit grid" highlightedCells={highlighted} showCoordinates={false} />
    <p style={{ color: 'var(--text)', fontSize: 13 }}>{step.cell ? 'Highlighted cells are the digits of the current run, read in order.' : 'Runs start from each cell in all eight directions.'}</p>
  </div>
}
