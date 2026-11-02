import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (t1, t2) => buildTrace({ t1, t2 }).result

function checkFrames(trace) {
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

test('1612 worked examples', () => {
  // a + (a + b) against (a + b) + a: both use a twice and b once.
  assert.equal(solve(['+', '+', 'a', 'a', 'b'], ['+', '+', 'a', 'b', 'a']), true)
  // a + (b + b) has one a and two b; a + (a + b) has two a and one b.
  assert.equal(solve(['+', '+', 'a', 'b', 'b'], ['+', '+', 'a', 'a', 'b']), false)
  assert.equal(solve(['a'], ['a']), true)
  checkFrames(buildTrace({ t1: ['+', '+', 'a', 'a', 'b'], t2: ['+', '+', 'a', 'b', 'a'] }))
})

test('1612 edge cases: a single letter differs from another letter; a repeat must match in count', () => {
  assert.equal(solve(['a'], ['b']), false)
  assert.equal(solve(['+', 'a', 'a'], ['a']), false)
  assert.equal(solve(['+', 'a', 'a'], ['+', 'a', 'a']), true)
})

// Oracle: addition is commutative and associative, so two sums agree on every assignment exactly when their
// variable multisets agree. Check by evaluating both expressions on random assignments.
function evaluate(tree, kids, i, env) {
  if (tree[i] !== '+') return env[tree[i]]
  return evaluate(tree, kids, kids[i][0], env) + evaluate(tree, kids, kids[i][1], env)
}

function kidsOf(tree) {
  const kids = {}
  const order = [0]
  let next = 1
  for (let p = 0; p < order.length; p++) {
    const i = order[p]
    kids[i] = []
    for (let side = 0; side < 2; side++) {
      if (next < tree.length) {
        if (tree[next] !== null) { kids[i].push(next); order.push(next) }
        next++
      }
    }
  }
  return kids
}

function randomExpression(rand, letters, size) {
  if (size <= 1) return { letter: letters[rand(letters.length)] }
  const left = 1 + rand(size - 1)
  return { left: randomExpression(rand, letters, left), right: randomExpression(rand, letters, size - left) }
}

function toLevelOrder(expr) {
  const out = []
  const queue = [expr]
  while (queue.length) {
    const node = queue.shift()
    if (!node) { out.push(null); continue }
    if (node.letter) { out.push(node.letter); queue.push(null, null); continue }
    out.push('+')
    queue.push(node.left, node.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

test('1612 random expressions agree with an evaluation oracle', () => {
  let seed = 1612
  const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 16) % k }
  const letters = ['a', 'b', 'c']
  for (let trial = 0; trial < 200; trial++) {
    const e1 = randomExpression(rand, letters, 1 + rand(5))
    const e2 = randomExpression(rand, letters, 1 + rand(5))
    const t1 = toLevelOrder(e1)
    const t2 = toLevelOrder(e2)
    if (t1.length > 15 || t2.length > 15) continue
    const k1 = kidsOf(t1)
    const k2 = kidsOf(t2)
    let agree = true
    for (let check = 0; check < 20 && agree; check++) {
      const env = { a: rand(10), b: rand(10), c: rand(10) }
      if (evaluate(t1, k1, 0, env) !== evaluate(t2, k2, 0, env)) agree = false
    }
    // Two sums with equal letter multisets always agree; with unequal multisets, random values almost surely differ.
    assert.equal(solve(t1, t2), agree, JSON.stringify({ t1, t2 }))
  }
})

test('1612 rejects a plus node without two children and a non-letter leaf', () => {
  assert.throws(() => parseInput('{"t1":["+","a"],"t2":["a"]}'))
  assert.throws(() => parseInput('{"t1":["A"],"t2":["a"]}'))
})
