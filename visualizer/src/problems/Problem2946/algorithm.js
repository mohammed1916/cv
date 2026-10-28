export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with mat and k.')
  const { mat, k } = input
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 6 || !Array.isArray(mat[0]) || mat[0].length < 1 || mat[0].length > 6) throw new Error('mat must be at most 6 by 6.')
  const n = mat[0].length
  if (mat.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 1 || v > 25))) throw new Error('mat must be rectangular, with integers from 1 to 25.')
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k must be an integer from 1 to 20.')
  return { mat, k }
}

export function buildTrace(input) {
  const { mat, k } = input
  const n = mat[0].length
  const shift = k % n
  const frames = [{ phase: 'start', activeLine: L('set shift to'), row: -1, shifted: null, message: `Shift by ${shift} (k modulo the row length ${n}).` }]
  for (let r = 0; r < mat.length; r++) {
    const row = mat[r]
    const shifted = []
    if (r % 2 === 0) {
      for (let j = 0; j < n; j++) shifted.push(row[(j - shift + n) % n])
    } else {
      for (let j = 0; j < n; j++) shifted.push(row[(j + shift) % n])
    }
    const direction = r % 2 === 0 ? 'right' : 'left'
    const same = shifted.every((v, j) => v === row[j])
    frames.push({ phase: 'row', activeLine: L(`shift the row ${direction}`), row: r, shifted, message: `Row ${r} shifted ${direction} becomes [${shifted.join(', ')}]${same ? ', which matches.' : ', which differs.'}` })
    if (!same) {
      frames.push({ phase: 'done', activeLine: L('return false'), row: r, shifted, message: 'A row changed, so the matrices are not similar.' })
      return { input, result: false, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), row: -1, shifted: null, message: 'Every row returns to itself, so the matrices are similar.' })
  return { input, result: true, frames }
}

export const code = `matrix similarity after cyclic shifts (mat, k):
  set shift to k modulo the row length
  for each row index r from the top
    if r is even then
      shift the row right by shift
    otherwise
      shift the row left by shift
    if the shifted row differs from the original row then
      return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def are_similar(mat, k):
    n = len(mat[0])
    shift = k % n
    for r, row in enumerate(mat):
        if r % 2 == 0:
            shifted = [row[(j - shift) % n] for j in range(n)]
        else:
            shifted = [row[(j + shift) % n] for j in range(n)]
        if shifted != row:
            return False
    return True
`
