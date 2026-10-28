import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = votes => buildTrace(parseInput(JSON.stringify({ votes }))).result

test('1366 official examples', () => {
  assert.equal(solve(['ABC', 'ACB', 'ABC', 'ACB', 'ACB']), 'ACB')
  assert.equal(solve(['WXYZ', 'XYZW']), 'XWYZ')
})

test('1366 a single ballot is the ranking', () => {
  assert.equal(solve(['ZMNAGUEDSJYLBOPHRQICWFXTVK']), 'ZMNAGUEDSJYLBOPHRQICWFXTVK')
})

test('1366 rejects a ballot that omits a team', () => {
  assert.throws(() => parseInput('{"votes":["AB","AC"]}'))
})

// Independent oracle: selection-style scan that keeps the best remaining team using a pairwise comparison.
function oracle(votes) {
  const teams = [...votes[0]]
  const places = votes[0].length
  const count = (team, pos) => votes.filter(v => v[pos] === team).length
  const better = (a, b) => {
    for (let pos = 0; pos < places; pos++) {
      const ca = count(a, pos)
      const cb = count(b, pos)
      if (ca !== cb) return ca > cb
    }
    return a < b
  }
  const left = [...teams]
  let out = ''
  while (left.length > 0) {
    let best = 0
    for (let i = 1; i < left.length; i++) if (better(left[i], left[best])) best = i
    out += left.splice(best, 1)[0]
  }
  return out
}

test('1366 random ballots match a pairwise-selection oracle', () => {
  let seed = 1366
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const teams = 'ABCDEF'.slice(0, 1 + rnd(6)).split('')
    const votes = []
    for (let v = 0; v < 1 + rnd(8); v++) {
      const ballot = [...teams]
      for (let i = ballot.length - 1; i > 0; i--) {
        const j = rnd(i + 1)
        ;[ballot[i], ballot[j]] = [ballot[j], ballot[i]]
      }
      votes.push(ballot.join(''))
    }
    assert.equal(solve(votes), oracle(votes), JSON.stringify(votes))
  }
})
