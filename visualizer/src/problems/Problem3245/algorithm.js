export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with colors and queries.')
  const { colors, queries } = input
  if (!Array.isArray(colors) || colors.length < 3 || colors.length > 10 || !colors.every(c => c === 0 || c === 1)) throw new Error('colors has 3 to 10 entries, each 0 or 1.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('Enter 1 to 8 queries.')
  const n = colors.length
  for (const q of queries) {
    if (!Array.isArray(q)) throw new Error('Each query is an array.')
    if (q[0] === 1 && q.length === 2 && Number.isInteger(q[1]) && q[1] >= 3 && q[1] <= n) continue
    if (q[0] === 2 && q.length === 3 && Number.isInteger(q[1]) && q[1] >= 0 && q[1] < n && (q[2] === 0 || q[2] === 1)) continue
    throw new Error(`Use [1, size] with 3 <= size <= ${n}, or [2, index, color] with color 0 or 1.`)
  }
  return { colors, queries }
}

// Runs of "differs from the next tile" around the circle; a window of size s needs s - 1 consecutive differing pairs.
function countGroups(colors, size) {
  const n = colors.length
  const good = colors.map((c, i) => c !== colors[(i + 1) % n])
  const runs = []
  if (good.every(Boolean)) return { count: n, runs: [n] }
  const start = good.indexOf(false)
  let total = 0, run = 0
  for (let k = 1; k <= n; k++) {
    const i = (start + k) % n
    if (good[i]) run++
    else {
      if (run > 0) runs.push(run)
      total += Math.max(0, run - size + 2)
      run = 0
    }
  }
  return { count: total, runs }
}

export function buildTrace({ colors, queries }) {
  const cols = colors.slice()
  const answers = []
  const frames = [{ phase: 'start', query: null, colors: cols.slice(), count: null, runs: [], activeLine: L('set answers to'), message: 'Tiles are on a circle. A group is alternating when neighbouring tiles differ.' }]
  for (const q of queries) {
    if (q[0] === 1) {
      const { count, runs } = countGroups(cols, q[1])
      answers.push(count)
      frames.push({ phase: 'count', query: q, colors: cols.slice(), count, runs, activeLine: L('append the count'), message: `Groups of size ${q[1]}: ${count}.` })
    } else {
      cols[q[1]] = q[2]
      frames.push({ phase: 'update', query: q, colors: cols.slice(), count: null, runs: [], activeLine: L('set colors[index] to color'), message: `Tile ${q[1]} is now colour ${q[2]}.` })
    }
  }
  frames.push({ phase: 'done', query: null, colors: cols.slice(), count: null, runs: [], activeLine: L('return answers'), message: `Answers: [${answers.join(', ')}].` })
  return { input: { colors, queries }, result: answers, frames }
}

export const code = `count alternating circular groups after each query
  set answers to an empty list
  for each query in order
    if the query is [1, size] then
      mark each pair of neighbouring tiles on the circle as good when their colours differ
      count windows of size minus 1 consecutive good pairs, using each run of good pairs
      append the count
    otherwise set colors[index] to color
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def alternating_groups(colors, queries):
    cols = list(colors)
    n = len(cols)
    out = []
    for q in queries:
        if q[0] == 1:
            size = q[1]
            good = [cols[i] != cols[(i + 1) % n] for i in range(n)]
            if all(good):
                out.append(n)
                continue
            start = good.index(False)
            total = run = 0
            for k in range(1, n + 1):
                i = (start + k) % n
                if good[i]:
                    run += 1
                else:
                    total += max(0, run - size + 2)
                    run = 0
            out.append(total)
        else:
            cols[q[1]] = q[2]
    return out
`
