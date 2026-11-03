import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('samples give the expected postorder', () => {
  assert.deepEqual(solve('[5,3,8,null,4,7,9]'), [4, 3, 7, 9, 8, 5])
  assert.deepEqual(solve('[4,2,null,1,3]'), [1, 3, 2, 4])
  assert.deepEqual(solve('[1]'), [1])
})

// Independent oracle: build random trees, compute postorder recursively, then serialize them level by level.
let state = 7
const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }

function randomTree(size) {
  const nodes = Array.from({ length: size }, (_, i) => ({ value: rand(19) - 9, left: null, right: null, id: i }))
  for (let k = 1; k < size; k++) {
    const free = nodes.slice(0, k).filter(n => !n.left || !n.right)
    const parent = free[rand(free.length)]
    if (!parent.left && (parent.right || rand(2))) parent.left = nodes[k]
    else if (!parent.right) parent.right = nodes[k]
    else parent.left = nodes[k]
  }
  return nodes[0]
}
function postorder(node, out = []) {
  if (!node) return out
  postorder(node.left, out); postorder(node.right, out); out.push(node.value)
  return out
}
function serialize(root) {
  const out = [root.value]
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    for (const child of [node.left, node.right]) {
      out.push(child ? child.value : null)
      if (child) queue.push(child)
    }
  }
  while (out.length > 1 && out.at(-1) === null) out.pop()
  return JSON.stringify(out)
}

test('random trees match a recursive postorder oracle', () => {
  for (let t = 0; t < 300; t++) {
    const root = randomTree(1 + rand(15))
    const text = serialize(root)
    assert.deepEqual(solve(text), postorder(root), text)
  }
})

test('frames map to real code and Python lines and end with the result', () => {
  const run = buildTrace(parseInput('[5,3,8,null,4,7,9]'))
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.split('\n').length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('malformed trees are rejected', () => {
  assert.throws(() => parseInput('[null,1]'), /root/)
  assert.throws(() => parseInput('[1,null,null,2]'), /parent/)
  assert.throws(() => parseInput('[1.5]'), /integers/)
  assert.throws(() => parseInput('not json'), /JSON/)
})
