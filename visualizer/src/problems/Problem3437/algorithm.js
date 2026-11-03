const lookup = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error('n is an integer from 1 to 6 for this view.')
  return { n }
}

export function buildTrace({ n }) {
  const L = text => lookup(code.map(line => line.text), text)
  const PY = text => lookup(python.split('\n'), text)
  const frames = []
  const result = []
  const path = []
  const used = Array(n + 1).fill(false)
  const snap = (phase, extra) => ({
    phase, path: path.slice(), used: used.slice(), results: result.map(row => row.slice()), value: null, last: path.length ? path[path.length - 1] : null,
    ...extra,
  })

  frames.push(snap('start', { pythonLine: PY('result = []'), activeLine: L('set result to an empty list'), message: `Build permutations of 1 to ${n} with neighbours of opposite parity.` }))

  const build = () => {
    if (path.length === n) {
      result.push(path.slice())
      frames.push(snap('record', { pythonLine: PY('if len(path) == n'), activeLine: L('if path has n values'), message: `Full permutation [${path.join(', ')}] is valid; record it.` }))
      return
    }
    frames.push(snap('enter', { pythonLine: PY('if len(path) == n'), activeLine: L('for each value v from 1 to n'), message: `Path is [${path.join(', ')}]; try each unused value next.` }))
    for (let value = 1; value <= n; value++) {
      if (used[value]) {
        frames.push(snap('reject', { pythonLine: PY('if used[value]'), activeLine: L('if v is already in path'), value, message: `${value} is already in the path.` }))
        continue
      }
      if (path.length > 0 && (path[path.length - 1] - value) % 2 === 0) {
        frames.push(snap('reject', { pythonLine: PY('if path and'), activeLine: L('the last value have the same parity'), value, message: `${value} has the same parity as ${path[path.length - 1]}, so it cannot follow it.` }))
        continue
      }
      path.push(value)
      used[value] = true
      frames.push(snap('place', { pythonLine: PY('path.append(value)'), activeLine: L('append v to path'), value, message: `Place ${value} at position ${path.length - 1}.` }))
      build()
      used[value] = false
      path.pop()
      frames.push(snap('undo', { pythonLine: PY('path.pop()'), activeLine: L('remove the last value from path'), value, message: `Backtrack: remove ${value} and try the next value.` }))
    }
  }
  build()

  frames.push(snap('done', { pythonLine: PY('return result'), activeLine: L('return result'), message: `${result.length} permutation${result.length === 1 ? '' : 's'} have alternating parity.` }))
  return { input: { n }, result, frames }
}

export const code = `alternating-parity permutations of 1 to n in lexicographic order
  set result to an empty list
  call build with an empty path
  build(path)
    if path has n values then add a copy of path to result and return
    for each value v from 1 to n
      if v is already in path then continue
      if path is not empty and v and the last value have the same parity then continue
      append v to path
      build(path)
      remove the last value from path
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def alternating_permutations(n):
    result = []
    path = []
    used = [False] * (n + 1)

    def build():
        if len(path) == n:
            result.append(path[:])
            return
        for value in range(1, n + 1):
            if used[value]:
                continue
            if path and (path[-1] - value) % 2 == 0:
                continue
            path.append(value)
            used[value] = True
            build()
            used[value] = False
            path.pop()

    build()
    return result
`
