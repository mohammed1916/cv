export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.matrix)) throw new Error('Use {"matrix": [[...]]} with an n x n adjacency matrix.')
  const matrix = data.matrix
  const n = matrix.length
  if (n < 1 || n > 8) throw new Error('The matrix must have 1 to 8 rows for the visualization.')
  if (matrix.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('The matrix must be square.')
  if (matrix.some(row => row.some(v => v !== 0 && v !== 1))) throw new Error('Entries must be 0 or 1.')
  for (let i = 0; i < n; i++) {
    if (matrix[i][i] !== 0) throw new Error('Diagonal entries must be 0 (no self-loops).')
    for (let j = 0; j < n; j++) if (matrix[i][j] !== matrix[j][i]) throw new Error('The matrix must be symmetric.')
  }
  return { matrix }
}

export function buildTrace(input) {
  const { matrix } = input
  const n = matrix.length
  const ans = Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: L('create an answer list'), row: -1, ans: [...ans], message: `Start with ${n} zero degrees, one per vertex.` }]
  for (let i = 0; i < n; i++) {
    const degree = matrix[i].reduce((a, b) => a + b, 0)
    ans[i] = degree
    frames.push({ phase: 'row', activeLine: L('set the degree'), row: i, ans: [...ans], message: `Row ${i} has ${degree} ones, so vertex ${i} has degree ${degree}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answer'), row: -1, ans: [...ans], message: `Degrees: [${ans.join(', ')}].` })
  return { input, result: ans, frames }
}

export const code = `degree of each vertex in an undirected graph
  let n be the number of rows in the matrix
  create an answer list with one zero for each vertex
  for each row index i from 0 to n minus 1
    add up the entries of row i
    set the degree of vertex i to that sum
  return the answer list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def degree_of_each_vertex(matrix):
    n = len(matrix)
    ans = [0] * n
    for i in range(n):
        ans[i] = sum(matrix[i])
    return ans
`
