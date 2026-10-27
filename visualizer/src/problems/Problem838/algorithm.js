export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 60 || !/^[LR.]+$/.test(s)) throw new Error('Enter a JSON string of 1-60 characters using only L, R and . (visualization cap: 60).')
  return s
}
export function buildTrace(s) {
  const n = s.length
  const force = new Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: 3, index: -1, f: 0, force: [...force], message: `Each domino gets a signed force: positive means falling right, negative means falling left. Strength n = ${n} at an initial push, decaying by 1 per cell.` }]
  let f = 0
  for (let i = 0; i < n; i++) {
    let why
    if (s[i] === 'R') { f = n; why = `'R' pushes right with maximum force ${n}.` }
    else if (s[i] === 'L') { f = 0; why = "'L' blocks any rightward force, so it resets to 0." }
    else { f = Math.max(f - 1, 0); why = `Standing domino: the rightward force decays to ${f}.` }
    force[i] += f
    frames.push({ phase: 'right', activeLine: 9, index: i, f, force: [...force], message: `Left-to-right at ${i}: ${why} Force[${i}] = ${force[i]}.` })
  }
  f = 0
  for (let i = n - 1; i >= 0; i--) {
    let why
    if (s[i] === 'L') { f = n; why = `'L' pushes left with maximum force ${n}.` }
    else if (s[i] === 'R') { f = 0; why = "'R' blocks any leftward force, so it resets to 0." }
    else { f = Math.max(f - 1, 0); why = `Standing domino: the leftward force decays to ${f}.` }
    force[i] -= f
    frames.push({ phase: 'left', activeLine: 15, index: i, f, force: [...force], message: `Right-to-left at ${i}: ${why} Net force[${i}] = ${force[i]}.` })
  }
  const out = force.map(x => (x > 0 ? 'R' : x < 0 ? 'L' : '.')).join('')
  frames.push({ phase: 'done', activeLine: 16, index: -1, f: 0, force: [...force], message: `Positive force falls R, negative falls L, zero stays upright (balanced or never touched): "${out}".` })
  return { input: s, result: out, frames }
}
export const code = `function pushDominoes(dominoes)
  set n to the number of dominoes
  create force[i] = 0 for every domino i
  set f to 0
  for i from 0 up to n - 1, scanning left to right
    if dominoes[i] is R then set f to n
    else if dominoes[i] is L then set f to 0
    otherwise set f to max(f - 1, 0)
    add f to force[i]
  set f to 0
  for i from n - 1 down to 0, scanning right to left
    if dominoes[i] is L then set f to n
    else if dominoes[i] is R then set f to 0
    otherwise set f to max(f - 1, 0)
    subtract f from force[i]
  return "R" where force > 0, "L" where force < 0, "." elsewhere`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def push_dominoes(dominoes):
    n = len(dominoes)
    force = [0] * n
    f = 0
    for i in range(n):
        if dominoes[i] == 'R':
            f = n
        elif dominoes[i] == 'L':
            f = 0
        else:
            f = max(f - 1, 0)
        force[i] += f
    f = 0
    for i in range(n - 1, -1, -1):
        if dominoes[i] == 'L':
            f = n
        elif dominoes[i] == 'R':
            f = 0
        else:
            f = max(f - 1, 0)
        force[i] -= f
    return ''.join('R' if x > 0 else 'L' if x < 0 else '.' for x in force)
`
