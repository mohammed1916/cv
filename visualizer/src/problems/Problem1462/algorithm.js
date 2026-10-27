import { pivotCells } from '../../components/shared/distanceMatrixModel.js'

export function parseInput(text) {
  const v = JSON.parse(text)
  const err = 'Enter {"n":3,"prerequisites":[[1,2],[0,1]],"queries":[[0,2]]}: 2 to 8 courses, at most 12 prerequisite pairs [a,b] (a must be taken before b, a != b, no pair repeated), and 1 to 6 queries [u,v] with u != v.'
  if (!v || typeof v !== 'object' || !Array.isArray(v.prerequisites) || !Array.isArray(v.queries)) throw new Error(err)
  const { n, prerequisites, queries } = v
  if (!Number.isInteger(n) || n < 2 || n > 8 || prerequisites.length > 12 || queries.length < 1 || queries.length > 6) throw new Error(err)
  const pair = p => Array.isArray(p) && p.length === 2 && p.every(Number.isInteger) && p.every(x => x >= 0 && x < n)
  if (!prerequisites.every(p => pair(p) && p[0] !== p[1]) || !queries.every(q => pair(q) && q[0] !== q[1])) throw new Error(err)
  const seen = new Set(prerequisites.map(([a, b]) => `${a},${b}`))
  if (seen.size !== prerequisites.length) throw new Error(err)
  return { n, prerequisites, queries }
}

const yesNo = reach => reach.map(row => row.map(x => (x ? 1 : 0)))

export function buildTrace({ n, prerequisites, queries }) {
  const reach = Array.from({ length: n }, () => Array(n).fill(0))
  for (const [a, b] of prerequisites) reach[a][b] = 1
  const snapshot = () => yesNo(reach)
  const frames = [{ phase: 'start', activeLine: L('set reach[a][b] to 1'), cell: null, highlighted: [], matrix: snapshot(), queue: [], message: 'Direct prerequisites only: reach[a][b] = 1 when a must come before b.' }]
  for (let k = 0; k < n; k++) {
    frames.push({ phase: 'pivot', activeLine: L('for each intermediate course k'), cell: null, highlighted: pivotCells(n, k), matrix: snapshot(), queue: [], message: `Course ${k} is now an intermediate: anything that reaches it reaches whatever it reaches.` })
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (reach[i][k] && reach[k][j] && !reach[i][j]) {
        reach[i][j] = 1
        frames.push({ phase: 'relax', activeLine: L('set reach[i][j] to 1'), cell: null, target: [i, j], highlighted: pivotCells(n, k), matrix: snapshot(), queue: [], message: `Through ${k}: course ${i} now reaches ${j}.` })
      }
    }
  }
  const result = queries.map(([u, v]) => reach[u][v] === 1)
  const queue = queries.map(([u, v], q) => `query ${q}: ${u} before ${v}? ${reach[u][v] ? 'yes' : 'no'}`)
  frames.push({ phase: 'done', activeLine: L('answer each query'), cell: null, highlighted: [], matrix: snapshot(), queue, message: `Answers: ${result.map(String).join(', ')}.` })
  return { input: { n, prerequisites, queries }, result, frames }
}

export const code = `can each query course be taken before the other course, through any chain
  set reach[a][b] to 1 for each prerequisite pair [a, b]
  for each intermediate course k from 0 to n-1
    for each start course i and end course j
      if reach[i][k] = 1 and reach[k][j] = 1 and reach[i][j] = 0 then
        set reach[i][j] to 1
  answer each query [u, v] with reach[u][v] = 1
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def check_if_prerequisite(n, prerequisites, queries):
    reach = [[0] * n for _ in range(n)]
    for a, b in prerequisites:
        reach[a][b] = 1
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if reach[i][k] == 1 and reach[k][j] == 1 and reach[i][j] == 0:
                    reach[i][j] = 1
    return [reach[u][v] == 1 for u, v in queries]
`
