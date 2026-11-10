import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { parseInput, buildTrace, code, python, phases } from './algorithm.js'
import { reverseListTutorial } from './tutorial.js'

const solve = values => buildTrace(parseInput(JSON.stringify(values))).result

test('reverses lists, including empty and single node', () => {
  assert.deepEqual(solve([]), [])
  assert.deepEqual(solve([17]), [17])
  assert.deepEqual(solve([7, 13]), [13, 7])
  assert.deepEqual(solve([12, 5, 19, 5, 3]), [3, 5, 19, 5, 12])
})

test('rejects malformed input', () => {
  assert.throws(() => parseInput('{"a":1}'), /array/)
  assert.throws(() => parseInput('[1,2.5]'), /integer/)
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,11,12,13]'), /0 to 12/)
})

test('each pointer rewire is its own frame, after the saved next', () => {
  const kinds = buildTrace(parseInput('[1,2,3]')).frames.map(f => f.kind)
  assert.deepEqual(kinds.slice(0, 2), ['init', 'init'])
  for (let i = 2; i < kinds.length - 2; i += 5) assert.deepEqual(kinds.slice(i, i + 5), ['check', 'save', 'rewire', 'move_prev', 'move_curr'])
  assert.equal(kinds.at(-2), 'check')
  assert.equal(kinds.at(-1), 'result')
})

test('frame lines match the displayed listing and rewires change only curr.next', () => {
  const run = buildTrace(parseInput('[4,5,6,7]'))
  for (const f of run.frames) assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
  const lineOf = { check: 5, save: 6, rewire: 7, move_prev: 8, move_curr: 9 }
  let prevLinks = null
  for (const f of run.frames) {
    if (f.kind === 'rewire' && prevLinks) {
      const changed = f.links.map((t, i) => (t !== prevLinks[i] ? i : -1)).filter(i => i >= 0)
      assert.deepEqual(changed, [f.curr])
    }
    if (lineOf[f.kind]) assert.equal(f.activeLine, lineOf[f.kind])
    prevLinks = f.links
  }
})

test('tutorial returns all fields for every frame, including empty and single node', () => {
  for (const text of ['[]', '[9]', '[1,2,3,4]']) {
    const run = buildTrace(parseInput(text))
    run.frames.forEach((step, i) => {
      const scene = reverseListTutorial({ run, step, previousStep: run.frames[i - 1] })
      for (const key of ['title', 'reason', 'action', 'variables', 'focus']) assert.ok(scene[key], `${text} ${i} ${key}`)
    })
  }
})

test('displayed Python gives the traced result on generated lists', () => {
  const harness = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
${python}
import json, sys
cases = json.loads(sys.stdin.read())
out = []
for values in cases:
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    node = Solution().reverseList(head)
    got = []
    while node:
        got.append(node.val)
        node = node.next
    out.append(got)
print(json.dumps(out))
`
  const cases = [[], [1], [2, 3], [1, 2, 3, 4, 5]]
  for (let k = 0; k < 40; k++) cases.push(Array.from({ length: (k % 11) + 1 }, (_, j) => (j * 37 + k * 11) % 50 - 25))
  const result = spawnSync(process.env.PYTHON || 'python3', ['-I', '-c', harness], { input: JSON.stringify(cases), encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(c => [...c].reverse()))
})

test('phases cover every frame kind', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const f of buildTrace(parseInput('[1,2]')).frames) assert.ok(ids.has(f.phase), f.phase)
})
