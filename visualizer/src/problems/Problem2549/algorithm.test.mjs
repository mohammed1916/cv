import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

function runPython(call) {
  const r = spawnSync('python3', ['-I', '-c', `${python}\nprint(${call})`], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}

test('2549 worked examples', () => {
  assert.equal(solve(5), 4)
  assert.equal(solve(1), 1)
  assert.equal(solve(10), 9)
})

test('2549 every frame points at an executable python line', () => {
  const lines = python.split('\n')
  for (const frame of buildTrace(parseInput('{"n": 5}')).frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
    assert.ok(lines[frame.pythonLine - 1].trim().length > 0)
  }
})

test('2549 python export agrees with the trace', () => {
  for (const n of [1, 2, 5, 10, 30]) {
    assert.equal(runPython(`distinctNumbersOnBoard(${n})`), String(solve(n)))
  }
})

test('2549 matches a worklist closure oracle and the n minus one pattern', () => {
  for (let n = 1; n <= 30; n++) {
    const seen = new Set([n])
    const queue = [n]
    while (queue.length) {
      const x = queue.pop()
      for (let i = 1; i <= n; i++) {
        if (x % i === 1 && !seen.has(i)) { seen.add(i); queue.push(i) }
      }
    }
    assert.equal(solve(n), seen.size, `closure n=${n}`)
    assert.equal(solve(n), n === 1 ? 1 : n - 1, `pattern n=${n}`)
  }
})

test('2549 rejects n outside the visualization range', () => {
  assert.throws(() => parseInput('{"n": 0}'))
  assert.throws(() => parseInput('{"n": 31}'))
})
