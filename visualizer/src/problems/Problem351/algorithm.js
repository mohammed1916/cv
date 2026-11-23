const MAX_LENGTH = 4

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with m and n.')
  const { m, n } = input
  if (!Number.isInteger(m) || !Number.isInteger(n) || m < 1 || n < m) throw new Error('Use integers with 1 <= m <= n.')
  if (n > MAX_LENGTH) throw new Error(`This view explores patterns up to length ${MAX_LENGTH}.`)
  return { m, n }
}

// Key in the middle of a move from a to b, or 0 when no key lies between them.
function middleKey(a, b) {
  const ra = Math.floor((a - 1) / 3)
  const ca = (a - 1) % 3
  const rb = Math.floor((b - 1) / 3)
  const cb = (b - 1) % 3
  const dr = rb - ra
  const dc = cb - ca
  if (Math.abs(dr) === 2 && Math.abs(dc) === 2) return 5
  if (Math.abs(dr) === 2 && dc === 0) return ((ra + rb) / 2) * 3 + ca + 1
  if (Math.abs(dc) === 2 && dr === 0) return ra * 3 + (ca + cb) / 2 + 1
  return 0
}

export function buildTrace({ m, n }) {
  const frames = []
  let total = 0
  const snap = extra => ({ path: [], blocked: null, length: 0, total, counted: false, ...extra })
  frames.push(snap({ phase: 'start', activeLine: L('let total = 0'), pythonLine: P('total = 0'), message: `Count patterns with between ${m} and ${n} keys.` }))
  const dfs = (path, visited) => {
    const last = path[path.length - 1]
    if (path.length >= m) {
      total += 1
      frames.push(snap({ phase: 'count', activeLine: L('total += 1'), pythonLine: P('total += 1'), path: [...path], length: path.length, total, counted: true,
        message: `Pattern ${path.join(' - ')} has ${path.length} key${path.length === 1 ? '' : 's'}: counted.` }))
    }
    if (path.length === n) return
    for (let next = 1; next <= 9; next++) {
      if (visited.has(next)) continue
      const between = middleKey(last, next)
      if (between && !visited.has(between)) {
        frames.push(snap({ phase: 'blocked', activeLine: L('if (between && !visited.has(between))'), pythonLine: P('if between and between not in visited'), path: [...path], blocked: between, length: path.length, total,
          message: `${last} to ${next} passes key ${between}, which is not visited yet: this move is not allowed.` }))
        continue
      }
      visited.add(next)
      path.push(next)
      frames.push(snap({ phase: 'extend', activeLine: L('visited.add(next)'), pythonLine: P('visited.add(nxt)'), path: [...path], length: path.length, total,
        message: `Move to key ${next}; the pattern now has ${path.length} key${path.length === 1 ? '' : 's'}.` }))
      dfs(path, visited)
      path.pop()
      visited.delete(next)
    }
  }
  for (let start = 1; start <= 9; start++) dfs([start], new Set([start]))
  frames.push(snap({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), total, message: `${total} valid unlock patterns with between ${m} and ${n} keys.` }))
  return { input: { m, n }, result: total, frames }
}

export const code = `function numberOfPatterns(m, n) {
  let total = 0
  const dfs = (path, visited) => {
    const last = path[path.length - 1]
    if (path.length >= m) total += 1
    if (path.length === n) return
    for (let next = 1; next <= 9; next++) {
      if (visited.has(next)) continue
      const between = middleKey(last, next)
      if (between && !visited.has(between)) continue
      visited.add(next)
      path.push(next)
      dfs(path, visited)
      path.pop()
      visited.delete(next)
    }
  }
  for (let start = 1; start <= 9; start++) dfs([start], new Set([start]))
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_patterns(m, n):
    def middle(a, b):
        ra, ca = divmod(a - 1, 3)
        rb, cb = divmod(b - 1, 3)
        dr, dc = rb - ra, cb - ca
        if abs(dr) == 2 and abs(dc) == 2:
            return 5
        if abs(dr) == 2 and dc == 0:
            return (ra + rb) // 2 * 3 + ca + 1
        if abs(dc) == 2 and dr == 0:
            return ra * 3 + (ca + cb) // 2 + 1
        return 0

    total = 0

    def dfs(last, visited, length):
        nonlocal total
        if length >= m:
            total += 1
        if length == n:
            return
        for nxt in range(1, 10):
            if nxt in visited:
                continue
            between = middle(last, nxt)
            if between and between not in visited:
                continue
            visited.add(nxt)
            dfs(nxt, visited, length + 1)
            visited.remove(nxt)

    for start in range(1, 10):
        dfs(start, {start}, 1)
    return total
`
const PY = python.split('\n')
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}
