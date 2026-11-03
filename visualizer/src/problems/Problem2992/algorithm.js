export const code = [
  'count permutations p of 1 to n where gcd(position, p[position]) is 1',
  '  set count to 0',
  '  call place(1)',
  '  return count',
  'define place(pos)',
  '  if pos is past n then add one to count and return',
  '  for each value v from 1 to n that is not used',
  '    if gcd(pos, v) is not 1 then skip v',
  '    set p[pos] to v and mark v as used',
  '    call place(pos + 1)',
  '    unmark v and clear p[pos]',
].map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `from math import gcd

def count_self_divisible(n):
    count = 0
    used = [False] * (n + 1)
    perm = [0] * (n + 1)

    def place(pos):
        nonlocal count
        if pos > n:
            count += 1
            return
        for v in range(1, n + 1):
            if used[v]:
                continue
            if gcd(pos, v) != 1:
                continue
            perm[pos] = v
            used[v] = True
            place(pos + 1)
            used[v] = False
            perm[pos] = 0

    place(1)
    return count
`
const PY = python.split('\n')
const P = s => {
  const index = PY.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function parseInput(text) {
  const n = Number(String(text).trim())
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error('Use one integer n from 1 to 6 for the visualization.')
  return n
}

export function buildTrace(n) {
  const frames = []
  const perm = Array(n + 1).fill(0)
  const used = Array(n + 1).fill(false)
  let count = 0
  const snap = () => ({ perm: perm.slice(1), used: used.slice(1), count })
  const push = (phase, pos, value, g, ok, message, activeText, pyText) => {
    frames.push({
      phase, pos, value, gcd: g, ok, message,
      activeLine: L(activeText), pythonLine: P(pyText),
      ...snap(),
    })
  }

  push('start', 0, 0, null, null, `Count permutations of 1 to ${n} where gcd(position, value) is 1 at every position.`, 'set count to 0', 'count = 0')

  function place(pos) {
    if (pos > n) {
      count += 1
      push('count', pos, 0, null, true, `Every position is filled. Permutation number ${count} is counted.`, 'add one to count', 'count += 1')
      return
    }
    push('place', pos, 0, null, null, `Fill position ${pos}. Try each unused value.`, 'for each value v', 'for v in range')
    for (let v = 1; v <= n; v++) {
      if (used[v]) continue
      const g = gcd(pos, v)
      if (g !== 1) {
        push('reject', pos, v, g, false, `gcd(${pos}, ${v}) = ${g}, so value ${v} cannot sit at position ${pos}.`, 'if gcd(pos, v) is not 1', 'if gcd(pos, v) != 1')
        continue
      }
      perm[pos] = v
      used[v] = true
      push('assign', pos, v, g, true, `gcd(${pos}, ${v}) = 1, so place ${v} at position ${pos}.`, 'set p[pos] to v', 'perm[pos] = v')
      place(pos + 1)
      used[v] = false
      perm[pos] = 0
      push('backtrack', pos, v, null, null, `Remove ${v} from position ${pos} and try the next value.`, 'unmark v and clear', 'perm[pos] = 0')
    }
  }

  place(1)
  frames.push({
    phase: 'done', pos: 0, value: 0, gcd: null, ok: true,
    message: `${count} self-divisible permutation${count === 1 ? '' : 's'} of 1 to ${n}.`,
    activeLine: L('return count'), pythonLine: P('return count'),
    ...snap(),
  })
  return { input: n, result: count, frames }
}
