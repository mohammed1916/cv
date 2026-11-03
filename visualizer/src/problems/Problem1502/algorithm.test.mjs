import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = arr => buildTrace({ arr }).result

// Independent oracle: try every ordering of the values and check the gaps directly.
function anyOrderWorks(values) {
  const permute = (rest, done) => rest.length === 0
    ? isProgression(done)
    : rest.some((v, i) => permute([...rest.slice(0, i), ...rest.slice(i + 1)], [...done, v]))
  return permute(values, [])
}
function isProgression(seq) {
  const d = seq[1] - seq[0]
  return seq.every((v, i) => i === 0 || v - seq[i - 1] === d)
}

test('1502 sample inputs give the expected answers', () => {
  assert.equal(solve([7, 1, 5, 9, 3]), true)
  assert.equal(solve([4, 1, 9, 2]), false)
  assert.equal(solve([-6, 0, -3, 3]), true)
  assert.equal(solve([5, 5, 5]), true)
})

test('1502 parseInput rejects malformed input', () => {
  assert.throws(() => parseInput('{"arr":[1]}'), /arr/)
  assert.throws(() => parseInput('{"arr":[1,"2"]}'), /arr/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

test('1502 random small arrays match the permutation oracle', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const arr = Array.from({ length: 2 + rnd(4) }, () => rnd(13) - 6)
    assert.equal(solve(arr), anyOrderWorks(arr), JSON.stringify(arr))
  }
})

test('1502 every frame names a real phase, code lines and narration', () => {
  const run = buildTrace({ arr: [7, 1, 5, 9, 3] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
