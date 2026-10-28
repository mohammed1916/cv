export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.possible) || input.possible.length < 2 || input.possible.length > 12) throw new Error('Use an object with possible: an array of 2 to 12 entries.')
  if (input.possible.some(v => v !== 0 && v !== 1)) throw new Error('Each possible entry is 0 (fail) or 1 (pass).')
  return { possible: input.possible }
}

export function buildTrace(input) {
  const { possible } = input
  const n = possible.length
  const points = possible.map(p => (p === 1 ? 1 : -1))
  const total = points.reduce((sum, p) => sum + p, 0)
  const frames = [{ phase: 'start', activeLine: L('set points[i]'), index: -1, alice: 0, bob: total, result: null, message: `Total points over all levels: ${total}.` }]
  let alice = 0
  let answer = -1
  for (let k = 1; k <= n - 1; k++) {
    alice += points[k - 1]
    const bob = total - alice
    const enough = alice > bob
    frames.push({ phase: 'scan', activeLine: L('add points[k - 1]'), index: k - 1, alice, bob, result: null, k, message: `Alice plays levels 0 to ${k - 1} for ${alice} points. Bob has ${bob}.` })
    if (enough) {
      frames.push({ phase: 'found', activeLine: L('then return k'), index: k - 1, alice, bob, result: k, k, message: `Alice gains more points with ${k} level(s).` })
      return { input, result: k, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), index: n, alice, bob: total - alice, result: answer, message: 'No split lets Alice gain more points.' })
  return { input, result: answer, frames }
}

export const code = `minimum number of levels Alice plays to gain more points than Bob
  set points[i] to 1 if possible[i] is 1, otherwise -1
  set total to the sum of all points
  set alice to 0
  for each level count k from 1 to n minus 1 do
    add points[k - 1] to alice
    if alice is more than total minus alice then return k
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_levels(possible):
    points = [1 if p == 1 else -1 for p in possible]
    total = sum(points)
    alice = 0
    for k in range(1, len(possible)):
        alice += points[k - 1]
        if alice > total - alice:
            return k
    return -1
`
