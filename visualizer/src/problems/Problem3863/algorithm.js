export const code = [
  'target is the letters of s in sorted order',
  'if s equals target then return 0',
  'level holds the strings reachable with ops moves',
  'for each string in level and each proper substring sort the substring',
  'add new strings to the next level',
  'add one to ops until the target appears in a level',
  'return ops',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1
const PY = key => python.split('\n').findIndex(line => line.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 8 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 8 lowercase letters (the visual searches all orders).')
  return { s }
}

export function buildTrace({ s }) {
  const n = s.length
  const target = [...s].sort().join('')
  const frames = [{ level: [s], ops: 0, count: 1, phase: 'setup', pythonLine: PY('target = '), activeLine: L('target is the letters'), message: `Target is ${target}.` }]
  if (s === target) {
    frames.push({ level: [s], ops: 0, count: 1, phase: 'done', pythonLine: PY('return 0'), activeLine: L('return 0'), message: 'Already sorted: 0 operations.' })
    return { input: { s }, result: 0, frames }
  }
  let level = [s]
  const seen = new Set([s])
  let ops = 0
  while (!level.includes(target)) {
    const next = []
    for (const cur of level) {
      for (let l = 0; l < n; l++) {
        for (let r = l + 1; r < n; r++) {
          if (l === 0 && r === n - 1) continue
          const sorted = [...cur.slice(l, r + 1)].sort().join('')
          const candidate = cur.slice(0, l) + sorted + cur.slice(r + 1)
          if (!seen.has(candidate)) { seen.add(candidate); next.push(candidate) }
        }
      }
    }
    ops++
    level = next
    frames.push({ level: level.slice(0, 8), count: level.length, ops, phase: 'level', pythonLine: PY('ops += 1'), activeLine: L('add one to ops'),
      message: `${level.length} new string${level.length === 1 ? '' : 's'} after ${ops} operation${ops === 1 ? '' : 's'}.` })
    if (level.length === 0) {
      frames.push({ level: [], count: 0, ops, pythonLine: PY('return -1'), phase: 'done', activeLine: L('return ops'), message: 'No substring sort can reach the sorted string, so the answer is -1.' })
      return { input: { s }, result: -1, frames }
    }
  }
  frames.push({ level: [target], count: 1, ops, phase: 'done', pythonLine: PY('return ops'), activeLine: L('return ops'), message: `Sorted after ${ops} operation${ops === 1 ? '' : 's'}.` })
  return { input: { s }, result: ops, frames }
}

export const python = `def min_operations_to_sort(s):
    target = ''.join(sorted(s))
    if s == target:
        return 0
    level = {s}
    seen = {s}
    ops = 0
    n = len(s)
    while target not in level:
        nxt = set()
        for cur in level:
            for l in range(n):
                for r in range(l + 1, n):
                    if l == 0 and r == n - 1:
                        continue
                    cand = cur[:l] + ''.join(sorted(cur[l:r + 1])) + cur[r + 1:]
                    if cand not in seen:
                        seen.add(cand)
                        nxt.add(cand)
        if not nxt:
            return -1
        level = nxt
        ops += 1
    return ops`
